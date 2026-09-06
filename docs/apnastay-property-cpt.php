<?php
/**
 * Plugin Name: ApnaStay Property Engine (Backend Foundation)
 * Description: Registers Custom Post Types, Taxonomies, Post Meta, and REST API Endpoints for ApnaStay Owner Property Listing.
 * Version: 1.0.0
 * Author: ApnaStay Engineering Team
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * 1. Register Custom Post Types: apnastay_property & apnastay_unit
 */
function apnastay_register_property_cpts() {
    // Primary Property Entity
    register_post_type('apnastay_property', [
        'labels' => [
            'name'               => __('Properties', 'apnastay'),
            'singular_name'      => __('Property', 'apnastay'),
            'add_new_item'       => __('Add New Property', 'apnastay'),
            'edit_item'          => __('Edit Property', 'apnastay'),
        ],
        'public'              => true,
        'show_in_rest'        => true,
        'supports'            => ['title', 'editor', 'author', 'thumbnail', 'custom-fields'],
        'capability_type'     => ['property', 'properties'],
        'map_meta_cap'        => true,
        'has_archive'         => 'properties',
        'rewrite'             => ['slug' => 'properties', 'with_front' => false],
    ]);

    // Relational Unit / Room Entity
    register_post_type('apnastay_unit', [
        'labels' => [
            'name'               => __('Units / Rooms', 'apnastay'),
            'singular_name'      => __('Unit / Room', 'apnastay'),
            'add_new_item'       => __('Add New Unit', 'apnastay'),
            'edit_item'          => __('Edit Unit', 'apnastay'),
        ],
        'public'              => false, // Internal relation linked via post_parent
        'show_ui'             => true,
        'show_in_rest'        => true,
        'supports'            => ['title', 'author', 'custom-fields'],
        'hierarchical'        => true, // Supports parent property assignment
        'capability_type'     => ['property', 'properties'],
        'map_meta_cap'        => true,
    ]);
}
add_action('init', 'apnastay_register_property_cpts');

/**
 * 2. Register Taxonomies
 */
function apnastay_register_property_taxonomies() {
    register_taxonomy('property_category', ['apnastay_property'], [
        'hierarchical' => false,
        'label'        => __('Property Categories', 'apnastay'),
        'show_in_rest' => true,
        'rewrite'      => ['slug' => 'property-category'],
    ]);

    register_taxonomy('property_amenity', ['apnastay_property'], [
        'hierarchical' => false,
        'label'        => __('Amenities', 'apnastay'),
        'show_in_rest' => true,
        'rewrite'      => ['slug' => 'property-amenity'],
    ]);
}
add_action('init', 'apnastay_register_property_taxonomies');

/**
 * 3. Register Post Meta
 */
function apnastay_register_property_meta() {
    // Property Meta
    register_post_meta('apnastay_property', '_apnastay_rental_structure', [
        'show_in_rest' => true,
        'single'       => true,
        'type'         => 'string',
    ]);
    register_post_meta('apnastay_property', '_apnastay_location_data', [
        'show_in_rest' => [
            'schema' => [
                'type'       => 'object',
                'properties' => [
                    'addressLine1' => ['type' => 'string'],
                    'addressLine2' => ['type' => 'string'],
                    'city'         => ['type' => 'string'],
                    'state'        => ['type' => 'string'],
                    'pincode'      => ['type' => 'string'],
                    'landmark'     => ['type' => 'string'],
                    'latitude'     => ['type' => 'number'],
                    'longitude'    => ['type' => 'number'],
                ],
            ],
        ],
        'single'       => true,
        'type'         => 'object',
    ]);
    register_post_meta('apnastay_property', '_apnastay_pricing', [
        'show_in_rest' => true,
        'single'       => true,
        'type'         => 'object',
    ]);
    register_post_meta('apnastay_property', '_apnastay_rules', [
        'show_in_rest' => true,
        'single'       => true,
        'type'         => 'object',
    ]);
    register_post_meta('apnastay_property', '_apnastay_completeness', [
        'show_in_rest' => true,
        'single'       => true,
        'type'         => 'integer',
        'default'      => 0,
    ]);

    // Unit Meta (Beds array stored directly within unit for high performance)
    register_post_meta('apnastay_unit', '_apnastay_pricing', [
        'show_in_rest' => true,
        'single'       => true,
        'type'         => 'object',
    ]);
    register_post_meta('apnastay_unit', '_apnastay_beds', [
        'show_in_rest' => [
            'schema' => [
                'type'  => 'array',
                'items' => [
                    'type'       => 'object',
                    'properties' => [
                        'id'           => ['type' => 'string'],
                        'label'        => ['type' => 'string'],
                        'bedType'      => ['type' => 'string'],
                        'availability' => ['type' => 'string'],
                        'monthlyRent'  => ['type' => 'number'],
                        'deposit'      => ['type' => 'number'],
                    ],
                ],
            ],
        ],
        'single'       => true,
        'type'         => 'array',
    ]);
}
add_action('init', 'apnastay_register_property_meta');

/**
 * 4. REST API Endpoints with Strict Ownership Verification
 */
add_action('rest_api_init', function () {
    // List & Create Properties
    register_rest_route('apnastay/v1', '/owner/properties', [
        [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => 'apnastay_rest_get_owner_properties',
            'permission_callback' => 'apnastay_check_owner_auth',
        ],
        [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => 'apnastay_rest_create_property_draft',
            'permission_callback' => 'apnastay_check_owner_auth',
        ],
    ]);

    // Single Property CRUD
    register_rest_route('apnastay/v1', '/owner/properties/(?P<id>[a-zA-Z0-9_-]+)', [
        [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => 'apnastay_rest_get_single_property',
            'permission_callback' => 'apnastay_check_property_ownership',
        ],
        [
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => 'apnastay_rest_update_property',
            'permission_callback' => 'apnastay_check_property_ownership',
        ],
        [
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => 'apnastay_rest_archive_property',
            'permission_callback' => 'apnastay_check_property_ownership',
        ],
    ]);
});

/**
 * Authorization Callback: Verify user has owner capability
 */
function apnastay_check_owner_auth($request) {
    return is_user_logged_in() && (current_user_can('apnastay_create_property') || current_user_can('administrator'));
}

/**
 * Authorization Callback: Verify user owns the specific property
 */
function apnastay_check_property_ownership($request) {
    if (!is_user_logged_in()) {
        return new WP_Error('rest_forbidden', __('You must be logged in.', 'apnastay'), ['status' => 401]);
    }
    if (current_user_can('administrator')) {
        return true;
    }
    $property_id = $request->get_param('id');
    $post = get_post($property_id);
    if (!$post || $post->post_type !== 'apnastay_property') {
        return new WP_Error('not_found', __('Property not found.', 'apnastay'), ['status' => 404]);
    }
    if ((int)$post->post_author !== get_current_user_id()) {
        return new WP_Error('forbidden', __('You do not own this property.', 'apnastay'), ['status' => 403]);
    }
    return true;
}
