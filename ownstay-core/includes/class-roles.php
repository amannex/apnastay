<?php
/**
 * Role-Based Access Control (RBAC) Management
 *
 * Defines and manages OwnStay user roles and granular capabilities
 * (GUEST, TENANT, OWNER, ADMIN).
 *
 * @package OwnStay_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Class OwnStay_Roles
 */
class OwnStay_Roles {

	/**
	 * Initialize RBAC hooks.
	 */
	public static function init() {
		// Ensure administrator role has all OwnStay administrative capabilities
		add_action( 'init', array( __CLASS__, 'ensure_admin_capabilities' ) );
	}

	/**
	 * Register OwnStay custom roles and granular capabilities.
	 *
	 * Called during plugin activation.
	 */
	public static function create_roles() {
		// Remove existing roles first if re-activating to refresh capabilities
		remove_role( 'ownstay_guest' );
		remove_role( 'ownstay_tenant' );
		remove_role( 'ownstay_owner' );
		remove_role( 'ownstay_admin' );

		// 1. GUEST Role: Unauthenticated or visiting user
		add_role(
			'ownstay_guest',
			__( 'OwnStay Guest', 'ownstay-core' ),
			array(
				'read'                    => true,
				'read_ownstay_properties' => true,
				'search_ownstay'          => true,
			)
		);

		// 2. TENANT Role: Verified or prospective tenant
		add_role(
			'ownstay_tenant',
			__( 'OwnStay Tenant', 'ownstay-core' ),
			array(
				'read'                    => true,
				'read_ownstay_properties' => true,
				'search_ownstay'          => true,
				'create_ownstay_wishlist' => true,
				'book_ownstay_visit'      => true,
				'create_ownstay_booking'  => true,
				'read_ownstay_messages'   => true,
				'send_ownstay_messages'   => true,
				'edit_ownstay_profile'    => true,
				'upload_files'            => true,
			)
		);

		// 3. OWNER Role: Verified property owner / landlord
		add_role(
			'ownstay_owner',
			__( 'OwnStay Property Owner', 'ownstay-core' ),
			array(
				'read'                    => true,
				'read_ownstay_properties' => true,
				'search_ownstay'          => true,
				'create_ownstay_property' => true,
				'edit_ownstay_property'   => true,
				'delete_ownstay_property' => true,
				'manage_ownstay_visits'   => true,
				'read_ownstay_bookings'   => true,
				'manage_ownstay_bookings' => true,
				'read_ownstay_messages'   => true,
				'send_ownstay_messages'   => true,
				'edit_ownstay_profile'    => true,
				'upload_files'            => true,
			)
		);

		// 4. ADMIN Role: Field Auditor / Marketplace Administrator
		add_role(
			'ownstay_admin',
			__( 'OwnStay Administrator', 'ownstay-core' ),
			array(
				'read'                      => true,
				'read_ownstay_properties'   => true,
				'create_ownstay_property'   => true,
				'edit_ownstay_property'     => true,
				'delete_ownstay_property'   => true,
				'verify_ownstay_properties' => true,
				'manage_ownstay_platform'   => true,
				'manage_ownstay_users'      => true,
				'read_ownstay_messages'     => true,
				'send_ownstay_messages'     => true,
				'manage_ownstay_payments'   => true,
				'upload_files'              => true,
			)
		);

		self::ensure_admin_capabilities();
	}

	/**
	 * Ensure WordPress Administrator role possesses all OwnStay capabilities.
	 */
	public static function ensure_admin_capabilities() {
		$admin_role = get_role( 'administrator' );
		if ( ! $admin_role ) {
			return;
		}

		$caps = array(
			'read_ownstay_properties',
			'create_ownstay_property',
			'edit_ownstay_property',
			'delete_ownstay_property',
			'verify_ownstay_properties',
			'manage_ownstay_platform',
			'manage_ownstay_users',
			'read_ownstay_messages',
			'send_ownstay_messages',
			'manage_ownstay_payments',
			'create_ownstay_wishlist',
			'book_ownstay_visit',
			'create_ownstay_booking',
		);

		foreach ( $caps as $cap ) {
			if ( ! $admin_role->has_cap( $cap ) ) {
				$admin_role->add_cap( $cap );
			}
		}
	}

	/**
	 * Remove custom roles on plugin uninstallation.
	 */
	public static function remove_roles() {
		remove_role( 'ownstay_guest' );
		remove_role( 'ownstay_tenant' );
		remove_role( 'ownstay_owner' );
		remove_role( 'ownstay_admin' );
	}

	/**
	 * Check if a user has a specific OwnStay capability.
	 *
	 * @param string $capability Capability name.
	 * @param int    $user_id    Optional User ID.
	 * @return bool
	 */
	public static function user_has_capability( $capability, $user_id = 0 ) {
		if ( empty( $user_id ) ) {
			$user_id = get_current_user_id();
		}

		if ( empty( $user_id ) ) {
			return false;
		}

		return user_can( $user_id, $capability );
	}
}
