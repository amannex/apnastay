<?php
/**
 * Fired during plugin activation and deactivation.
 *
 * @package OwnStay_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Class OwnStay_Activator
 */
class OwnStay_Activator {

	/**
	 * Execute activation tasks.
	 *
	 * Registers custom roles and flushes WordPress rewrite rules.
	 */
	public static function activate() {
		// 1. Create RBAC roles and granular capabilities
		require_once dirname( __FILE__ ) . '/class-roles.php';
		OwnStay_Roles::create_roles();

		// 2. Set default options if needed
		if ( false === get_option( 'ownstay_core_installed' ) ) {
			update_option( 'ownstay_core_installed', time() );
			update_option( 'ownstay_core_version', '1.0.0' );
		}

		// 3. Flush rewrite rules so custom endpoints function cleanly
		flush_rewrite_rules();
	}

	/**
	 * Execute deactivation tasks.
	 */
	public static function deactivate() {
		flush_rewrite_rules();
	}
}
