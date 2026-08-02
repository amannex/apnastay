<?php
/**
 * REST API User Controller
 *
 * Manages user profile retrieval, KYC verification status, and admin
 * role assignments via /wp-json/ownstay/v1/users/ endpoints.
 *
 * @package OwnStay_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Class OwnStay_User_Controller
 */
class OwnStay_User_Controller extends WP_REST_Controller {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->namespace = 'ownstay/v1';
		$this->rest_base = 'users';
	}

	/**
	 * Register REST API routes.
	 */
	public function register_routes() {
		// 1. GET /ownstay/v1/users (Admin only)
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_users' ),
					'permission_callback' => array( $this, 'check_admin_permission' ),
					'args'                => array(
						'role' => array(
							'required'          => false,
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
			)
		);

		// 2. GET /ownstay/v1/users/<id>
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_user' ),
					'permission_callback' => array( 'OwnStay_Auth', 'require_auth' ),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_user' ),
					'permission_callback' => array( $this, 'check_update_permission' ),
				),
			)
		);

		// 3. PUT /ownstay/v1/users/<id>/role (Admin only)
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>\d+)/role',
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_user_role' ),
					'permission_callback' => array( $this, 'check_admin_permission' ),
					'args'                => array(
						'role' => array(
							'required'          => true,
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
			)
		);
	}

	/**
	 * Permission callback for admin-only endpoints.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return bool|WP_Error
	 */
	public function check_admin_permission( $request ) {
		return OwnStay_Auth::require_role( 'admin', $request );
	}

	/**
	 * Permission callback for user update (self or admin).
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return bool|WP_Error
	 */
	public function check_update_permission( $request ) {
		$auth_check = OwnStay_Auth::require_auth( $request );
		if ( is_wp_error( $auth_check ) ) {
			return $auth_check;
		}

		$target_id = (int) $request->get_param( 'id' );
		$user_id   = get_current_user_id();

		if ( $user_id === $target_id || ownstay_is_role( 'admin', $user_id ) ) {
			return true;
		}

		return ownstay_error_response(
			'ownstay_forbidden',
			__( 'You do not have permission to edit this user profile.', 'ownstay-core' ),
			403
		);
	}

	/**
	 * Get list of marketplace users (filtered by role).
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response
	 */
	public function get_users( $request ) {
		$args = array( 'number' => 50 );
		$role = $request->get_param( 'role' );

		if ( ! empty( $role ) ) {
			$args['role'] = 'ownstay_' . strtolower( $role );
		}

		$query = new WP_User_Query( $args );
		$users = $query->get_results();

		$data = array();
		foreach ( $users as $user ) {
			$data[] = ownstay_get_user_profile_summary( $user );
		}

		return ownstay_json_response( $data, 200 );
	}

	/**
	 * Get single user profile.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_user( $request ) {
		$target_id = (int) $request->get_param( 'id' );
		$user      = get_userdata( $target_id );

		if ( ! $user ) {
			return ownstay_error_response( 'ownstay_user_not_found', 'User not found.', 404 );
		}

		return ownstay_json_response( ownstay_get_user_profile_summary( $user ), 200 );
	}

	/**
	 * Update user profile details & KYC verification status.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_user( $request ) {
		$target_id = (int) $request->get_param( 'id' );
		$user      = get_userdata( $target_id );

		if ( ! $user ) {
			return ownstay_error_response( 'ownstay_user_not_found', 'User not found.', 404 );
		}

		// Update display name / names
		if ( $request->has_param( 'first_name' ) ) {
			update_user_meta( $target_id, 'first_name', sanitize_text_field( $request->get_param( 'first_name' ) ) );
		}
		if ( $request->has_param( 'last_name' ) ) {
			update_user_meta( $target_id, 'last_name', sanitize_text_field( $request->get_param( 'last_name' ) ) );
		}
		if ( $request->has_param( 'phone' ) ) {
			update_user_meta( $target_id, 'ownstay_phone', sanitize_text_field( $request->get_param( 'phone' ) ) );
		}
		if ( $request->has_param( 'verification_status' ) && ownstay_is_role( 'admin' ) ) {
			update_user_meta(
				$target_id,
				'ownstay_verification_status',
				sanitize_text_field( $request->get_param( 'verification_status' ) )
			);
		}

		return ownstay_json_response( ownstay_get_user_profile_summary( $target_id ), 200 );
	}

	/**
	 * Assign or update user's RBAC role (Admin only).
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_user_role( $request ) {
		$target_id = (int) $request->get_param( 'id' );
		$new_role  = strtoupper( $request->get_param( 'role' ) );

		$result = OwnStay_Auth::switch_user_role( $target_id, $new_role );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return ownstay_json_response(
			array(
				'user'    => ownstay_get_user_profile_summary( $target_id ),
				'role'    => $new_role,
				'message' => __( 'User role updated successfully.', 'ownstay-core' ),
			),
			200
		);
	}
}
