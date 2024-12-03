<?php
/**
 * EGroupware - Schulmanager
 */

/*if (!defined('SCHULMANAGER_APP'))
{
	define('SCHULMANAGER_APP','schulmanager');
}*/

$setup_info['schulmanager']['name']      = 'schulmanager';
$setup_info['schulmanager']['title']     = 'SchulManager';
$setup_info['schulmanager']['version']   = '23.1.20241101';
$setup_info['schulmanager']['app_order'] = 5;        // at the end
$setup_info['schulmanager']['tables']    = array('egw_schulmanager_asv_schueler_stamm','egw_schulmanager_asv_klassengruppe','egw_schulmanager_asv_klasse',
    'egw_schulmanager_asv_unterrichtselement','egw_schulmanager_asv_fachgruppe','egw_schulmanager_asv_schueler_schuljahr','egw_schulmanager_asv_lehrer_unterr_faecher',
    'egw_schulmanager_asv_schuelerfach','egw_schulmanager_asv_besuchtes_fach','egw_schulmanager_asv_lehrer_stamm','egw_schulmanager_asv_lehrer_schuljahr',
    'egw_schulmanager_asv_lehrer_schuljahr_schule',
    'egw_schulmanager_note','egw_schulmanager_note_extra','egw_schulmanager_asv_klassenleitung',
    'egw_schulmanager_config','egw_schulmanager_note_gew','egw_schulmanager_asv_werteliste','egw_schulmanager_asv_schule_fach','egw_schulmanager_asv_jahrgangsstufe','egw_schulmanager_substitution',
    'egw_schulmanager_asv_schullaufbahn','egw_schulmanager_lehrer_account','egw_schulmanager_asv_schuelerkommunikation','egw_schulmanager_asv_schueleranschrift','egw_schulmanager_sreportcontent',
    'egw_schulmanager_unterrichtselement2', 'egw_schulmanager_unterrichtselement2_lehrer', 'egw_schulmanager_unterrichtselement2_schueler');

$setup_info['schulmanager']['enable']    = 1;


/* The hooks this app includes, needed for hooks registration */
$setup_info['schulmanager']['hooks']['sidebox_menu'] = 'schulmanager_hooks::all_hooks';
$setup_info['schulmanager']['hooks']['admin'] = 'schulmanager_hooks::all_hooks';
$setup_info['schulmanager']['hooks']['settings'] = 'schulmanager_hooks::settings';

// Setup
$setup_info['schulmanager']['check_install'] = array(
    'Text_Diff'	=> array(
        'func'	=> 'pear_check',
        'from'	=> 'Schulmanager (diff in notifications)'
    )
);

/* Dependencies for this app to work */
$setup_info['schulmanager']['depends'][] = array
(
    'appname'  => 'api',
    'versions' => Array('21.1')
);
