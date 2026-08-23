<?php
/**
 * ApnaStay CMS Integration - WordPress Webhook Trigger Snippet
 * 
 * Paste this snippet into your WordPress active theme's functions.php file
 * or inside a custom plugin to automate cache flushing on Next.js frontend
 * when blog posts are published, updated, or deleted.
 */

// Prevent direct file access
if (!defined('ABSPATH')) {
    exit;
}

function apnastay_trigger_nextjs_revalidation($new_status, $old_status, $post) {
    // Only execute webhook when dealing with standard 'post' type
    if ($post->post_type !== 'post') {
        return;
    }

    // Trigger webhook if a post is published, updated, or taken down (drafted/trashed)
    $is_published = ($new_status === 'publish');
    $was_published = ($old_status === 'publish');

    if ($is_published || $was_published) {
        // Define your Next.js site URL and Secret Key
        $frontend_url = 'https://apnastay.com/api/revalidate-blog'; // Replace with your production domain
        $secret_key = 'apnastay-wp-cms-secret-key-2026'; // Match WP_WEBHOOK_SECRET env variable

        // Perform asynchronous background post request using WordPress HTTP API
        wp_remote_post($frontend_url, array(
            'method'      => 'POST',
            'blocking'    => false, // Non-blocking request so WordPress dashboard remains fast
            'sslverify'   => true,
            'headers'     => array(
                'Content-Type'            => 'application/json',
                'x-apnastay-webhook-key'  => $secret_key
            ),
            'body'        => json_encode(array(
                'post_id'    => $post->ID,
                'post_slug'  => $post->post_name,
                'action'     => $new_status
            ))
        ));
    }
}

// Register Hook on WordPress status transitions
add_action('transition_post_status', 'apnastay_trigger_nextjs_revalidation', 10, 3);
