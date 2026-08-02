<?php
/**
 * Helper Functions for OwnStay Core
 *
 * Global utility functions for role-based access control (RBAC),
 * formatting, and REST API response standardization.
 *
 * @package OwnStay_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Get the primary OwnStay role for a user.
 *
 * @param int $user_id User ID. If 0, defaults to current user.
 * @return string Role slug ('guest', 'tenant', 'owner', 'admin').
 */
function ownstay_get_user_role( $user_id = 0 ) {
	if ( empty( $user_id ) ) {
		$user_id = get_current_user_id();
	}

	if ( empty( $user_id ) ) {
		return 'guest';
	}

	$user = get_userdata( $user_id );
	if ( ! $user ) {
		return 'guest';
	}

	$roles = (array) $user->roles;

	if ( in_array( 'administrator', $roles, true ) || in_array( 'ownstay_admin', $roles, true ) ) {
		return 'admin';
	}

	if ( in_array( 'ownstay_owner', $roles, true ) || in_array( 'owner', $roles, true ) ) {
		return 'owner';
	}

	if ( in_array( 'ownstay_tenant', $roles, true ) || in_array( 'tenant', $roles, true ) ) {
		return 'tenant';
	}

	return 'guest';
}

/**
 * Check if a user has a specific OwnStay role.
 *
 * @param string|array $required_roles Role slug or array of role slugs.
 * @param int          $user_id        User ID. If 0, defaults to current user.
 * @return bool True if user has the role, false otherwise.
 */
function ownstay_is_role( $required_roles, $user_id = 0 ) {
	$current_role = ownstay_get_user_role( $user_id );

	if ( is_string( $required_roles ) ) {
		$required_roles = array( $required_roles );
	}

	// Admin always has permission unless explicitly checked otherwise
	if ( 'admin' === $current_role ) {
		return true;
	}

	return in_array( strtolower( $current_role ), array_map( 'strtolower', (array) $required_roles ), true );
}

/**
 * Format a standardized JSON response for OwnStay REST API.
 *
 * @param mixed $data   Response payload data.
 * @param int   $status HTTP status code.
 * @return WP_REST_Response
 */
function ownstay_json_response( $data, $status = 200 ) {
	$response_body = array(
		'success'   => ( $status >= 200 && $status < 300 ),
		'status'    => $status,
		'data'      => $data,
		'timestamp' => current_time( 'mysql' ),
	);

	return new WP_REST_Response( $response_body, $status );
}

/**
 * Format a standardized error response for OwnStay REST API.
 *
 * @param string $code    Error code string.
 * @param string $message Error message.
 * @param int    $status  HTTP status code.
 * @return WP_Error
 */
function ownstay_error_response( $code, $message, $status = 400 ) {
	return new WP_Error(
		$code,
		$message,
		array( 'status' => $status )
	);
}

/**
 * Get user profile summary array for API responses.
 *
 * @param WP_User|int $user WP_User object or user ID.
 * @return array
 */
function ownstay_get_user_profile_summary( $user ) {
	if ( is_numeric( $user ) ) {
		$user = get_userdata( $user );
	}

	if ( ! $user || ! ( $user instanceof WP_User ) ) {
		return array();
	}

	$role = ownstay_get_user_role( $user->ID );

	return array(
		'id'                  => $user->ID,
		'email'               => $user->user_email,
		'first_name'          => $user->first_name ? $user->first_name : $user->display_name,
		'last_name'           => $user->last_name,
		'display_name'        => $user->display_name,
		'role'                => strtoupper( $role ),
		'verification_status' => get_user_meta( $user->ID, 'ownstay_verification_status', true ) ?: 'UNVERIFIED',
		'phone'               => get_user_meta( $user->ID, 'ownstay_phone', true ) ?: '',
		'avatar_url'          => get_avatar_url( $user->ID ),
	);
}
