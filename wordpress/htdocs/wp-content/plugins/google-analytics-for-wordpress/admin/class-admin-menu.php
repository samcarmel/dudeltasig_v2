<?php
/**
 * @package GoogleAnalytics\Admin
 */

/**
 * This class is for the backend, extendable for all child classes
 */
class Yoast_GA_Admin_Menu {

	/**
	 * @var object $target_object The property used for storing target object (class admin)
	 */
	private $target_object;

	/**
	 * @var boolean $dashboard_disabled The dashboards disabled bool
	 */
	private $dashboards_disabled;

	/**
	 * The parent slug for the submenu items based on if the dashboards are disabled or not.
	 *
	 * @var string
	 */
	private $parent_slug;

	/**
	 * Setting the target_object and adding actions
	 *
	 * @param object $target_object
	 */
	public function __construct( $target_object ) {

		$this->target_object = $target_object;

		add_action( 'admin_menu', array( $this, 'create_admin_menu' ), 10 );
		add_action('admin_head', array( $this, 'mi_add_styles_for_menu' ) );

		if ( ! function_exists( 'is_plugin_active_for_network' ) ) {
			require_once( ABSPATH . '/wp-admin/includes/plugin.php' );
		}

		if ( is_plugin_active_for_network( GAWP_PATH ) ) {
			add_action( 'network_admin_menu', array( $this, 'create_admin_menu' ), 5 );
		}

		$this->dashboards_disabled = Yoast_GA_Settings::get_instance()->dashboards_disabled();
		$this->parent_slug         = ( ( $this->dashboards_disabled ) ? 'yst_ga_settings' : 'yst_ga_dashboard' );
	}

	public function mi_add_styles_for_menu() {
		?>
		<style type="text/css">
		.toplevel_page_yst_ga_dashboard .wp-menu-image img {
			padding: 6px 0 0 !important;
		}
		</style>
		<?php
	}

	/**
	 * Create the admin menu
	 */
	public function create_admin_menu() {
		/**
		 * Filter: 'wpga_menu_on_top' - Allows filtering of menu location of the GA plugin, if false is returned, it moves to bottom.
		 *
		 * @api book unsigned
		 */

		// Base 64 encoded SVG image
		$icon_svg = 'data:image/png;base64,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';

		$menu_name = is_network_admin() ? 'extensions' : 'dashboard';

		if ( $this->dashboards_disabled ) {
			$menu_name = 'settings';
		}

		// Add main page
		add_menu_page(
			__( 'Google Analytics by MonsterInsights:', 'google-analytics-for-wordpress' ) . ' ' . __( 'General settings', 'google-analytics-for-wordpress' ), __( 'MonsterInsights', 'google-analytics-for-wordpress' ), 'manage_options', 'yst_ga_' . $menu_name,
			array(
				$this->target_object,
				'load_page',
			),
			$icon_svg,
			$this->get_menu_position()
		);


		$this->add_submenu_pages();
	}

	/**
	 * Get the menu position of the Analytics item
	 *
	 * @return string
	 */
	private function get_menu_position() {
		$on_top = apply_filters( 'wpga_menu_on_top', true );

		if ( $on_top ) {
			$position = $this->get_menu_position_value( 'top' );

		}
		else {
			$position = $this->get_menu_position_value( 'bottom' );
		}

		// If the dashboards are disabled, force the menu item to stay at the bottom of the menu
		if ( $this->dashboards_disabled ) {
			$position = $this->get_menu_position_value( 'bottom' );
		}

		return $position;
	}

	/**
	 * Get the top or bottom menu location number
	 *
	 * @param string $location
	 *
	 * @return string
	 */
	private function get_menu_position_value( $location ) {
		if ( $location == 'top' ) {
			return '2.00013467543';
		}

		return '100.00013467543';
	}

	/**
	 * Prepares an array that can be used to add a submenu page to the Google Analytics for Wordpress menu
	 *
	 * @param string $submenu_name
	 * @param string $submenu_slug
	 * @param string $font_color
	 *
	 * @return array
	 */
	private function prepare_submenu_page( $submenu_name, $submenu_slug, $font_color = '' ) {
		return array(
			'parent_slug'      => $this->parent_slug,
			'page_title'       => __( 'Google Analytics by MonsterInsights:', 'google-analytics-for-wordpress' ) . ' ' . $submenu_name,
			'menu_title'       => $this->parse_menu_title( $submenu_name, $font_color ),
			'capability'       => 'manage_options',
			'menu_slug'        => 'yst_ga_' . $submenu_slug,
			'submenu_function' => array( $this->target_object, 'load_page' ),
		);
	}

	/**
	 * Parsing the menutitle
	 *
	 * @param string $menu_title
	 * @param string $font_color
	 *
	 * @return string
	 */
	private function parse_menu_title( $menu_title, $font_color ) {
		if ( ! empty( $font_color ) ) {
			$menu_title = '<span style="color:' . $font_color . '">' . $menu_title . '</span>';
		}

		return $menu_title;
	}

	/**
	 * Adds a submenu page to the Google Analytics for WordPress menu
	 *
	 * @param array $submenu_page
	 */
	private function add_submenu_page( $submenu_page ) {
		$page         = add_submenu_page( $submenu_page['parent_slug'], $submenu_page['page_title'], $submenu_page['menu_title'], $submenu_page['capability'], $submenu_page['menu_slug'], $submenu_page['submenu_function'] );
		$is_dashboard = ( 'yst_ga_dashboard' === $submenu_page['menu_slug'] );
		$this->add_assets( $page, $is_dashboard );
	}

	/**
	 * Adding stylesheets and based on $is_not_dashboard maybe some more styles and scripts.
	 *
	 * @param string  $page
	 * @param boolean $is_dashboard
	 */
	private function add_assets( $page, $is_dashboard ) {
		add_action( 'admin_print_styles-' . $page, array( 'Yoast_GA_Admin_Assets', 'enqueue_styles' ) );
		add_action( 'admin_print_styles-' . $page, array( 'Yoast_GA_Admin_Assets', 'enqueue_settings_styles' ) );
		add_action( 'admin_print_scripts-' . $page, array( 'Yoast_GA_Admin_Assets', 'enqueue_scripts' ) );
		if ( ! $is_dashboard && filter_input( INPUT_GET, 'page' ) === 'yst_ga_dashboard' ) {
			Yoast_GA_Admin_Assets::enqueue_dashboard_assets();
		}
	}

	/**
	 * Prepares and adds submenu pages to the Google Analytics for Wordpress menu:
	 * - Dashboard
	 * - Settings
	 * - Extensions
	 *
	 * @return void
	 */
	private function add_submenu_pages() {
		foreach ( $this->get_submenu_types() as $submenu ) {
			if ( isset( $submenu['color'] ) ) {
				$submenu_page = $this->prepare_submenu_page( $submenu['label'], $submenu['slug'], $submenu['color'] );
			}
			else {
				$submenu_page = $this->prepare_submenu_page( $submenu['label'], $submenu['slug'] );
			}
			$this->add_submenu_page( $submenu_page );
		}
	}

	/**
	 * Determine which submenu types should be added as a submenu page.
	 *
	 * Dashboard can be disables by user
	 *
	 * Dashboard and settings are disables in network admin
	 *
	 * @return array
	 */
	private function get_submenu_types() {
		/**
		 * Array structure:
		 *
		 * array(
		 *   $submenu_name => array(
		 *        'color' => $font_color,
		 *        'label' => __( 'text-label', 'google-analytics-for-wordpress' ),
		 * 		  'slug'  => $menu_slug,
		 *        ),
		 *   ..,
		 * )
		 *
		 * $font_color can be left empty.
		 *
		 */
		$submenu_types = array();

		if ( ! is_network_admin() ) {

			if ( ! $this->dashboards_disabled ) {
				$submenu_types['dashboard'] = array(
					'label' => __( 'Dashboard', 'google-analytics-for-wordpress' ),
					'slug'  => 'dashboard',
				);
			}

			$submenu_types['settings'] = array(
				'label' => __( 'Settings', 'google-analytics-for-wordpress' ),
				'slug'  => 'settings',
			);
		}

		$submenu_types['extensions'] = array(
			'color' => '#f18500',
			'label' => __( 'Extensions', 'google-analytics-for-wordpress' ),
			'slug'  => 'extensions',
		);

		return $submenu_types;
	}
}