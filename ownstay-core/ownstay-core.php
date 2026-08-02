<?php
/**
 * Plugin Name:       OwnStay Core
 * Plugin URI:        https://ownstay.com
 * Description:       Backend application layer & RBAC engine for OwnStay Zero-Brokerage Verified Property Rental Platform.
 * Version:           1.0.0
 * Author:            OwnStay Engineering Team
 * Author URI:        https://ownstay.com
 * Text Domain:       ownstay-core
 * Domain Path:       /languages
 *
 * @package OwnStay_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// 1. Define Core Constants
define( 'OWNSTAY_CORE_VERSION', '1.0.0' );
define( 'OWNSTAY_CORE_PATH', plugin_dir_path( __FILE__ ) );
define( 'OWNSTAY_CORE_URL', plugin_dir_url( __FILE__ ) );

// 2. Load Core Dependencies
require_once OWNSTAY_CORE_PATH . 'includes/helpers.php';
require_once OWNSTAY_CORE_PATH . 'includes/class-activator.php';
require_once OWNSTAY_CORE_PATH . 'includes/class-roles.php';
require_once OWNSTAY_CORE_PATH . 'includes/class-auth.php';
require_once OWNSTAY_CORE_PATH . 'includes/class-api.php';

// 3. Register Activation and Deactivation Hooks
register_activation_hook( __FILE__, array( 'OwnStay_Activator', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'OwnStay_Activator', 'deactivate' ) );

// 4. Initialize Core Modules on Plugins Loaded
function ownstay_core_bootstrap() {
	OwnStay_Roles::init();
	OwnStay_Auth::init();
	OwnStay_API::init();
}
add_action( 'plugins_loaded', 'ownstay_core_bootstrap' );
