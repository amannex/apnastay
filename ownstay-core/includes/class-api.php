<?php
/**
 * REST API Manager
 *
 * Bootstraps and registers all OwnStay custom REST API routes under
 * the /wp-json/ownstay/v1/ namespace.
 *
 * @package OwnStay_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Class OwnStay_API
 */
class OwnStay_API {

	/**
	 * Initialize REST API hooks.
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * Register API routes by instantiating controllers.
	 */
	public static function register_routes() {
		// Load Controllers
		require_once dirname( dirname( __FILE__ ) ) . '/api/class-auth-controller.php';
		require_once dirname( dirname( __FILE__ ) ) . '/api/class-user-controller.php';

		// Register Auth routes (/ownstay/v1/auth/...)
		$auth_controller = new OwnStay_Auth_Controller();
		$auth_controller->register_routes();

		// Register User routes (/ownstay/v1/users/...)
		$user_controller = new OwnStay_User_Controller();
		$user_controller->register_routes();
	}
}
