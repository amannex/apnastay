<?php
/**
 * REST API Auth Controller
 *
 * Handles authentication, login, logout, current user session check,
 * and RBAC role switching via /wp-json/ownstay/v1/auth/ endpoints.
 *
 * @package OwnStay_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Class OwnStay_Auth_Controller
 */
class OwnStay_Auth_Controller extends WP_REST_Controller {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->namespace = 'ownstay/v1';
		$this->rest_base = 'auth';
	}

	/**
	 * Register REST API routes.
	 */
	public function register_routes() {
		// 1. POST /ownstay/v1/auth/login
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/login',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'login' ),
					'permission_callback' => '__return_true',
					'args'                => array(
						'email'    => array(
							'required'          => true,
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_email',
						),
						'password' => array(
							'required'          => true,
							'type'              => 'string',
						),
					),
				),
			)
		);

		// 2. POST /ownstay/v1/auth/logout
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/logout',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'logout' ),
					'permission_callback' => array( 'OwnStay_Auth', 'require_auth' ),
				),
			)
		);

		// 3. GET /ownstay/v1/auth/me
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/me',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_current_user_profile' ),
					'permission_callback' => array( 'OwnStay_Auth', 'require_auth' ),
				),
			)
		);

		// 4. POST /ownstay/v1/auth/switch-role
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/switch-role',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'switch_role' ),
					'permission_callback' => array( 'OwnStay_Auth', 'require_auth' ),
					'args'                => array(
						'role' => array(
							'required' => true,
							'type'     => 'string',
						),
					),
				),
			)
		);
	}

	/**
	 * Handle user login and return RBAC profile.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function login( $request ) {
		$email    = $request->get_param( 'email' );
		$password = $request->get_param( 'password' );

		$user = wp_authenticate_email_password( null, $email, $password );

		if ( is_wp_error( $user ) ) {
			return ownstay_error_response(
				'ownstay_invalid_credentials',
				__( 'Invalid email or password.', 'ownstay-core' ),
				401
			);
		}

		wp_set_current_user( $user->ID );
		wp_set_auth_cookie( $user->ID, true );

		$profile = ownstay_get_user_profile_summary( $user );

		return ownstay_json_response(
			array(
				'user'    => $profile,
				'role'    => $profile['role'],
				'message' => __( 'Authentication successful.', 'ownstay-core' ),
			),
			200
		);
	}

	/**
	 * Handle user logout.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response
	 */
	public function logout( $request ) {
		wp_logout();

		return ownstay_json_response(
			array(
				'message' => __( 'Logged out successfully.', 'ownstay-core' ),
			),
			200
		);
	}

	/**
	 * Get active authenticated user profile & RBAC role.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response
	 */
	public function get_current_user_profile( $request ) {
		$user_id = get_current_user_id();
		$profile = ownstay_get_user_profile_summary( $user_id );

		return ownstay_json_response(
			array(
				'user' => $profile,
				'role' => $profile['role'],
			),
			200
		);
	}

	/**
	 * Switch current user's primary RBAC role.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function switch_role( $request ) {
		$user_id  = get_current_user_id();
		$new_role = strtoupper( sanitize_text_field( $request->get_param( 'role' ) ) );

		$result = OwnStay_Auth::switch_user_role( $user_id, $new_role );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$profile = ownstay_get_user_profile_summary( $user_id );

		return ownstay_json_response(
			array(
				'user'    => $profile,
				'role'    => $profile['role'],
				'message' => sprintf( __( 'Role switched to %s.', 'ownstay-core' ), $profile['role'] ),
			),
			200
		);
	}
}
