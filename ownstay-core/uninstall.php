<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @package OwnStay_Core
 */

// If uninstall not called from WordPress, exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Optionally clean up RBAC roles on uninstall
require_once dirname( __FILE__ ) . '/includes/class-roles.php';
if ( class_exists( 'OwnStay_Roles' ) ) {
	OwnStay_Roles::remove_roles();
}

// Clean up plugin version / install flags
delete_option( 'ownstay_core_installed' );
delete_option( 'ownstay_core_version' );
