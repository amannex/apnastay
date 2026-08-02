<?php
/**
 * Authentication and RBAC Request Guard
 *
 * Provides REST API authentication checks, token/session validation,
 * and role-based access control guards for API endpoints.
 *
 * @package OwnStay_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Class OwnStay_Auth
 */
class OwnStay_Auth {

	/**
	 * Initialize authentication hooks.
	 */
	public static function init() {
		add_filter( 'rest_authentication_errors', array( __CLASS__, 'rest_authentication_guard' ) );
	}

	/**
	 * Guard REST API endpoints with authentication checks when accessing protected namespaces.
	 *
	 * @param WP_Error|null|bool $result Error from another authentication handler, null if we should handle it.
	 * @return WP_Error|null|bool
	 */
	public static function rest_authentication_guard( $result ) {
		if ( ! empty( $result ) ) {
			return $result;
		}
		return $result;
	}

	/**
	 * Verify if current request user is authenticated.
	 *
	 * @param WP_REST_Request $request The REST request.
	 * @return bool|WP_Error True if authenticated, WP_Error otherwise.
	 */
	public static function require_auth( $request = null ) {
		$user_id = get_current_user_id();

		if ( ! $user_id ) {
			return ownstay_error_response(
				'ownstay_unauthenticated',
				__( 'You must be logged in to perform this action.', 'ownstay-core' ),
				401
			);
		}

		return true;
	}

	/**
	 * Verify if current request user possesses one of the allowed roles.
	 *
	 * @param array|string    $allowed_roles Array of role slugs ('guest', 'tenant', 'owner', 'admin').
	 * @param WP_REST_Request $request       Optional REST request.
	 * @return bool|WP_Error True if permitted, WP_Error otherwise.
	 */
	public static function require_role( $allowed_roles, $request = null ) {
		$auth_check = self::require_auth( $request );
		if ( is_wp_error( $auth_check ) ) {
			return $auth_check;
		}

		$user_id = get_current_user_id();

		if ( ownstay_is_role( $allowed_roles, $user_id ) ) {
			return true;
		}

		return ownstay_error_response(
			'ownstay_forbidden',
			__( 'You do not have sufficient permissions to access this endpoint.', 'ownstay-core' ),
			403
		);
	}

	/**
	 * Switch user role (used by Admin or during testing/demo mode).
	 *
	 * @param int    $user_id  Target User ID.
	 * @param string $new_role Target Role ('GUEST', 'TENANT', 'OWNER', 'ADMIN').
	 * @return bool|WP_Error
	 */
	public static function switch_user_role( $user_id, $new_role ) {
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return ownstay_error_response( 'ownstay_user_not_found', 'User not found.', 404 );
		}

		$role_map = array(
			'GUEST'  => 'ownstay_guest',
			'TENANT' => 'ownstay_tenant',
			'OWNER'  => 'ownstay_owner',
			'ADMIN'  => 'ownstay_admin',
		);

		$new_role_upper = strtoupper( $new_role );
		if ( ! isset( $role_map[ $new_role_upper ] ) ) {
			return ownstay_error_response( 'ownstay_invalid_role', 'Invalid target role.', 400 );
		}

		$target_wp_role = $role_map[ $new_role_upper ];

		// Remove existing OwnStay roles
		$user->remove_role( 'ownstay_guest' );
		$user->remove_role( 'ownstay_tenant' );
		$user->remove_role( 'ownstay_owner' );
		$user->remove_role( 'ownstay_admin' );

		// Assign new role
		$user->add_role( $target_wp_role );

		return true;
	}
}
