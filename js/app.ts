/**
 * EGroupware Schulmanager
 *
 * @link http://www.egroupware.org
 * @package schulmanager
 * @author Axel Wild <info-AT-wild-solutions.de>
 * @copyright (c) 2023 by info-AT-wild-solutions.de
 * @license http://opensource.org/licenses/gpl-license.php GPL - GNU General Public License
 */

import {EgwApp} from '../../api/js/jsapi/egw_app';

import {etemplate2} from "../../api/js/etemplate/etemplate2";
import {et2_nextmatch} from "../../api/js/etemplate/et2_extension_nextmatch";
import {et2_dialog} from "../../api/js/etemplate/et2_widget_dialog";
import {Et2Select} from "../../api/js/etemplate/Et2Select/Et2Select";
import {Et2Date} from "../../api/js/etemplate/Et2Date/Et2Date";
import {Et2Checkbox} from "../../api/js/etemplate/Et2Checkbox/Et2Checkbox";

export class SchulmanagerApp extends EgwApp
{
	readonly appname = 'schulmanager';

	constructor()
	{
		super('schulmanager');

	}

	/**
	 * This function is called when the etemplate2 object is loaded
	 * and ready.  If you must store a reference to the et2 object,
	 * make sure to clean it up in destroy().
	 *
	 * @param et2 etemplate2 Newly ready object
	 * @param string name
	 */
	et2_ready(et2, name: string)
	{
		// call parent
		super.et2_ready(et2, name);

		if (name == 'schulmanager.notenmanager.index') {
            this.header_change();
		}
		if (name == 'schulmanager.notenmanager.edit') {
            this.toggleEditGradesInput(true);
        }
		if (name == 'schulmanager.calendar.index') {
			this.cal_header_change();
			this.cal_hide_items();			
        }
		if (name == 'schulmanager.notenmanager.notendetails') {
			this.header_change();
		}
		if (name == 'schulmanager.schuelerview') {
			this.onSchuelerViewKlasseChanged(null, null);
		}
	}


	/**
	 * laden der gewichtungen beim ersten Laden des Templates
	 * @returns {undefined}
	 */
	header_change()
	{
		let et2 = this.et2;
		let func = 'schulmanager.schulmanager_ui.ajax_getGewichtungen';
		let query = '';
		this.egw.json(func, [query], function (totals) {
			for (let key in totals){
				let widget = et2.getWidgetById(key);
				if(widget){
					widget.set_value(totals[key]);
				}
			}
		}).sendRequest(true);
	}

	// export notenbuch
	exportpdf_nb(_id, _widget)
	{
		this.egw.loading_prompt('schulmanager',true, this.egw.lang('please wait...'));
		let $a = jQuery(document.createElement('a')).appendTo('body').hide();
		let url = window.egw.webserverUrl+'/index.php?menuaction=schulmanager.schulmanager_download_ui.exportpdf_nb';
		$a.prop('href',url);
		$a.prop('download','');
		$a[0].click();
		$a.remove();
		this.egw.loading_prompt('schulmanager',false);
	}


	/**
	 * download all grades in all subjects of all students as pdf
	 * @param {type} _id
	 * @param {type} _widget
	 * @returns {undefined}
	 */
	exportpdf_kv(_id, _widget){
		let id = _widget.id;
		let params = 'mode=stud';

		if(id == "button[pdfexportteacherzz]"){
			params = 'mode=teacher_zz';
		}
		else if(id == "button[pdfexportteacherjz]"){
			params = 'mode=teacher_jz';
		}

		let modal = document.getElementById("schulmanager-notenmanager-klassenview_showexportmodal");
		modal.style.display = "none";

		this.egw.loading_prompt('schulmanager',true,egw.lang('please wait...'));

		let $a = jQuery(document.createElement('a')).appendTo('body').hide();
		let url = window.egw.webserverUrl+'/index.php?menuaction=schulmanager.schulmanager_download_ui.exportpdf_kv&'+params;
		$a.prop('href',url);
		$a.prop('download','');
		$a[0].click();
		$a.remove();

		egw.loading_prompt('schulmanager',false);
	}



	schuelerview_zz_edit(_id, _widget){
		let modal = document.getElementById("schulmanager-schuelerview_zzeditmodal");
		modal.style.display = "block";

	}

	schuelerview_jz_edit(_id, _widget){
		let modal = document.getElementById("schulmanager-schuelerview_jzeditmodal");
		modal.style.display = "block";
	}

	/**
	 * Vorbereitung Notenbericht / Zwischenzeugnis
	 * @param _id
	 * @param _widget
	 */
	schuelerview_zz_commit(_id, _widget){
		let instance = this;
		let model = document.getElementById('schulmanager-schuelerview_zzeditmodal');
		model.style.display='none';

		let tokenDiv = <HTMLInputElement> document.getElementById('schulmanager-schuelerview_token');
		let token = tokenDiv.value;
		let gefaehrdWidget = <HTMLSelectElement> document.getElementById('schulmanager-schuelerview_zzeditmodal_zzeditcontent_select_zz_gefaehrdung');
		let gefaehrd = gefaehrdWidget.value;

		let zzabweis = document.getElementById('schulmanager-schuelerview_zzeditmodal_zzeditcontent_zzabweis').checked;

		let func = 'schulmanager.schulmanager_ui.ajax_schuelerview_zz_commit';
		this.egw.json(func, [gefaehrd, zzabweis, token], function (result) {
			instance.schuelerViewUpdate(instance, result);

		}).sendRequest(true);
	}

	/**
	 * reload klassleiter before pdf export
	 * @param _id
	 * @param _widget
	 */
	exportpdf_nbericht_prepare(_id, _widget){
		let modal = document.getElementById("schulmanager-notenmanager-klassenview_showexportmodal");
		modal.style.display = "block";
		let func = 'schulmanager.schulmanager_ui.ajax_nbericht_prepare';
		this.egw.json(func, [], function (result) {
			if(_widget !== null) {
				let select_klassleiter = _widget.getRoot().getWidgetById('klassleiter');
				let options = [];
				for (let key in result['klassleiter']){
					options.push({value:key, label: result['klassleiter'][key]});
				}
				select_klassleiter.set_select_options(options);
				select_klassleiter.set_value(0);
			}
		}).sendRequest(true);
	}

	/**
	 * download all grades in all subjects of all students as pdf handout for students
	 * @param {type} _id
	 * @param {type} _widget
	 * @returns {undefined}
	 */
	exportpdf_nbericht(_id, _widget){
		let modal = document.getElementById("schulmanager-notenmanager-klassenview_showexportmodal");
		modal.style.display = "none";
		this.egw.loading_prompt('schulmanager',true, this.egw.lang('please wait...'));
		let showReturn = document.getElementById('schulmanager-notenmanager-klassenview_showexportmodal_showexportcontent_add_return_block').checked;
		let showSigned = document.getElementById('schulmanager-notenmanager-klassenview_showexportmodal_showexportcontent_add_signed_block').checked;
		let signerWidget = <HTMLSelectElement> document.getElementById('schulmanager-notenmanager-klassenview_showexportmodal_showexportcontent_klassleiter');
		let signerid = signerWidget.value;
		let $a = jQuery(document.createElement('a')).appendTo('body').hide();
		let url = window.egw.webserverUrl+'/index.php?menuaction=schulmanager.schulmanager_download_ui.exportpdf_nbericht&showReturnInfo='+showReturn+'&signed='+showSigned+'&signerid='+signerid;
		$a.prop('href',url);
		$a.prop('download','');
		$a[0].click();
		$a.remove();
		this.egw.loading_prompt('schulmanager',false);
	}

	/**
	 * export notenbuch
	 * @param _id
	 * @param _widget
	 */
	exportpdf_calm(_id, _widget)
	{
		let egw = this.egw;
        egw.loading_prompt('schulmanager',true,egw.lang('please wait...'));
		let $a = jQuery(document.createElement('a')).appendTo('body').hide();
		let url = window.egw.webserverUrl+'/index.php?menuaction=schulmanager.schulmanager_download_ui.exportpdf_calm';
		$a.prop('href',url);
		$a.prop('download','');
		$a[0].click();
		$a.remove();
		this.egw.loading_prompt('schulmanager',false);
	}


	/**
	 * laden der weekdays
	 * @param {type} _action
	 * @returns {undefined}
	 */
	cal_header_change()
	{
		let et2 = this.et2;
		let func = 'schulmanager.schulmanager_cal_ui.ajax_getWeekdays';

		let query = '';
		this.egw.json(func, [query], function (result) {
			for (let key in result['nm_header']){
				let widget = et2.getWidgetById(key);
				if(widget){
					widget.getDOMNode().childNodes[0].innerHTML = result['nm_header'][key]['nr'];
					widget.getDOMNode().childNodes[1].innerHTML = result['nm_header'][key]['name'];
					widget.parentNode.parentNode.classList.remove('sm_cal_saso');
					widget.parentNode.parentNode.classList.remove('sm_cal_mofr');
					widget.parentNode.parentNode.classList.add(result['nm_header'][key]['class']);

					if (result['nm_header'][key]['class'] == 'sm_cal_saso' && widget.getDOMNode().childNodes[2]) {
                        widget.getDOMNode().childNodes[2].style.display = "none";
                    }
				}
			}
		}).sendRequest(true);
	}

	cal_hide_items()
	{
		egw.css(".sm_cal_hidden","display:none");
	}

	cal_focus_item(_action, widget)
	{
		let _send = function() {
			egw().json(
				'schulmanager.schulmanager_cal_ui.ajax_editCalEvent',
				[
					widget.id
				],
				// Remove loading spinner
				function(result) {					
					jQuery(_action).blur();
				}
			).sendRequest(true);
		};
		_send();
	}

	calEditMultiple(_action, widget)
	{
		//alert(widget.id);
		let _send = function() {
			egw().json(
				'schulmanager.schulmanager_cal_ui.ajax_editCalEvent',
				[
					widget.id,
					true
				],
				// Remove loading spinner
				function(result) {
					jQuery(_action).blur();
					//alert(result['test']);
				}
			).sendRequest(true);
		};
		_send();
	}

	calDeleteEvent(_action, widget)
	{
		//alert(widget[0].id);
		let _send = function() {
			egw().json(
				'schulmanager.schulmanager_cal_ui.ajax_deleteEvent',
				[
					widget[0].id
				],
				// Remove loading spinner
				function(result) {
					egw(window).refresh(result['msg'], 'schulmanager', 'schulmanager-calendar-editevent', 'update');
					var nm = etemplate2.getById('schulmanager-calendar-editevent').widgetContainer.getWidgetById('nm');
					nm.refresh(null,'update');
				}
			).sendRequest(true);
		};
		_send();
	}

	add_list_event(widget,prefix){
		let et2 = this.et2;
		let type_id = prefix.concat('sm_type_options_list');
		let fach_id = prefix.concat('sm_fach_options_list');
		let user_id = prefix.concat('sm_user_list');

		let type = (<HTMLInputElement> document.getElementById(type_id)).value;
		let fach = (<HTMLInputElement> document.getElementById(fach_id)).value;
		let user = null;

		if(document.getElementById(user_id)){
			user = (<HTMLInputElement> document.getElementById(user_id)).value;
		}
		else{
			user_id = prefix.concat('sm_activeuserID');
			user = (<HTMLInputElement> document.getElementById(user_id)).value;
		}

		let _send = function() {
			egw().json(
				'schulmanager.schulmanager_cal_ui.ajax_addEventToList',
				[
					type,
					fach,
					user
				],
				// Remove loading spinner
				function(result : any) {
					egw(window).refresh(result['msg'], 'schulmanager', 'schulmanager-calendar-editevent', 'update');
					let nm = etemplate2.getById('schulmanager-calendar-editevent').widgetContainer.getWidgetById('nm');
					nm.refresh(null,'update');
				}
			).sendRequest(true);
		};
		_send();

	}

	calShowAddEvent(action, selected){
		jQuery('table.addnewevent').css('display','inline');
	}

	nmEditGew(_action, widget)
	{
		jQuery('table.editgew').css('display','inline');
	}


	/**
	 *
	 * @param {egwAction} action
	 * @param {egwActionObject[]} _senders
	 */
	changeNote(action, _senders)
	{
		let tokenDiv = <HTMLInputElement> document.getElementById('schulmanager-notenmanager-edit_token');
		//let inputinfo_date = <HTMLInputElement> document.getElementById('schulmanager-notenmanager-edit_date').firstChild;
		let inputinfo_date = <HTMLInputElement> document.getElementById('schulmanager-notenmanager-edit_inputinfo_date');//.firstChild;
		let inputinfo_type = <HTMLInputElement> document.getElementById('schulmanager-notenmanager-edit_inputinfo_notgebart');
		let inputinfo_desc = <HTMLInputElement> document.getElementById('schulmanager-notenmanager-edit_inputinfo_desc');

		let func = 'schulmanager.schulmanager_ui.ajax_noteModified';
		let noteKey = action.name;
		let noteVal = action.value;
		let token = tokenDiv.value;

		let note_date = inputinfo_date.value;
		let note_type = inputinfo_type.value;
		let note_desc = inputinfo_desc.value;

		if(_senders.nodeName == "ET2-CHECKBOX"){
			noteKey = _senders._widget_id;
			if(_senders.checked){
				noteVal = 1;
			}else{
				noteVal = 0;
			}
		}
		this.egw.json(func, [noteKey, noteVal, token, note_date, note_type, note_desc], function (result) {
			if(result.error_msg){
				egw(window).message(result.error_msg, 'error');
			}
			else{
				jQuery(action).addClass('schulmanager_note_changed');
				for (let key in result){
					let cssAvgKey = 'schulmanager-notenmanager-edit_'+key+'[-1][note]';
					let widget = <HTMLInputElement> document.getElementById(cssAvgKey);
					if(widget){
						widget.value = result[key]['[-1][note]'];
						if(action.id == cssAvgKey){
							// reset css class if this input value has been modified
							jQuery(action).removeClass('nm_avg_manuell');
							jQuery(action).removeClass('nm_avg_auto');
							jQuery(action).addClass(result[key]['avgclass']);
						}
					}
				}
			}
		}).sendRequest(true);
	}


	
    changeGew(action, senders)
	{
		let et2 = this.et2;
		let func = 'schulmanager.schulmanager_ui.ajax_gewModified';
		let gewKey = action.name;
		let gewVal = action.value;

		this.egw.json(func, [gewKey, gewVal], function (result) {
			jQuery(action).addClass('schulmanager_note_changed');
			for (let key in result){
				let cssAvgKey = 'schulmanager-notenmanager-edit_'+key+'[-1][note]';
				let widget = <HTMLInputElement> document.getElementById(cssAvgKey);
				if(widget){
					widget.value = result[key]['[-1][note]'];
				}
			}
		}).sendRequest(true);
	}

	changeGewAllModified(_action, _senders)
	{

		let et2 = this.et2;
		let func = 'schulmanager.schulmanager_ui.ajax_gewAllModified';
		//let noteKey = _action.name;
		let noteKey = _senders._widget_id;
		let noteVal = _action.value;
		//if(_action.type == "checkbox"){
		if(_senders.nodeName == "ET2-CHECKBOX"){
			if(_senders.checked){
				noteVal = 1;
			}else{
				noteVal = 0;
			}
		}
		this.egw.json(func, [noteKey, noteVal], function (result) {
			jQuery(_action).addClass('schulmanager_note_changed');
			for (let key in result){
				let cssAvgKey = 'schulmanager-notenmanager-edit_'+key+'[-1][note]';
				let cssAltBKey = 'schulmanager-notenmanager-edit_nm_rows_'+key+'[-1][checked]';
				let widget = <HTMLInputElement> document.getElementById(cssAvgKey);
				let widgetAltB = <HTMLInputElement> document.getElementById(cssAltBKey);
				if(widget){
					widget.value = result[key]['[-1][note]'];
					if(_action.id == cssAvgKey){
						jQuery(_action).removeClass('nm_avg_manuell');
						jQuery(_action).removeClass('nm_avg_auto');
						jQuery(_action).addClass(result[key]['avgclass']);
					}
				}
				else if(widgetAltB){
					widgetAltB.checked = result[key]['[-1][checked]'];
				}
			}
		}).sendRequest(true);
	}
	
	/**
	 * selectes teacher for a new substitution changed, reload list
	 */
	subs_TeacherChanged(_action, _widget)
	{
		let et2 = this.et2;
		let func = 'schulmanager.schulmanager_substitution_ui.ajax_getTeacherLessonList';
		let teacher_id = _widget.value;
		
		this.egw.json(func, [teacher_id], function (result) {
			let select_lesson = _widget.getRoot().getWidgetById('add_lesson_list');
			let options = [];
			for (let key in result){
				options.push({value:key, label: result[key]});
			}
			select_lesson.set_select_options(options);
			select_lesson.set_value(0);

			/*let widget = <Et2Select> document.getElementById('schulmanager-substitution_add_lesson_list');
			if(widget){
				while (widget.firstChild) {
					widget.removeChild(widget.firstChild);
				}
				for (let key in result){
					let item = new SlMenuItem();
					item.value = key;
					item.innerText = result[key];
					widget.appendChild(item);
				}
			}*/
		}).sendRequest(true);
	}

	/**
	 * AJAX loading student
	 * @param _action
	 * @param _senders
	 */
	onDetailsNote(_action, _senders)
	{

		let modal = document.getElementById("schulmanager-notenmanager-index_showdetailsmodal");
		modal.style.display = "block";

		let instance = this;
		let stud_id = _senders[0]._index;
		let func = 'schulmanager.schulmanager_ui.ajax_getStudentDetails';

		this.egw.json(func, [stud_id], function (result) {
			let modal = document.getElementById("schulmanager-notenmanager-index");
			modal.style.display = "block";

			for (let key in result){
				// noten
				if(key == 'details_noten'){
					instance.updateDetailsNoten(key, result, 'schulmanager-notenmanager-index_showdetailsmodal_showdetailscontent_details_noten');
				}
				else {
					let widget_id = 'schulmanager-notenmanager-index_showdetailsmodal_showdetailscontent_' + key;
					let widget = <HTMLInputElement>document.getElementById(widget_id);
					if (widget) {
						widget.innerText = result[key];
					}
				}
			}
			jQuery('#schulmanager-notenmanager-index_schulmanager-notenmanager-details').css('display','inline');
		}).sendRequest(true);
	}

	/**
	 * AJAX loading student
	 * @param _action
	 * @param _senders
	 */
	onContactData(_action, _senders)
	{
		let modal = document.getElementById("schulmanager-notenmanager-index_showcontactmodal");
		modal.style.display = "block";

		let instance = this;
		let stud_id = _senders[0]._index;
		let func = 'schulmanager.schulmanager_ui.ajax_getStudentContact';

		this.egw.json(func, [stud_id], function (result) {
			let modal = document.getElementById("schulmanager-notenmanager-index");
			modal.style.display = "block";

			instance.tableUpdate("schulmanager-notenmanager-index_grid-sko", result['sko_nm_rows']);
			instance.tableUpdate("schulmanager-notenmanager-index_grid-san", result['san_nm_rows']);
			delete result['sko_nm_rows'];
			delete result['san_nm_rows'];

			for (let key in result){
				let widget_id = 'schulmanager-notenmanager-index_showcontactmodal_showcontactcontent_' + key;
				let widget = <HTMLInputElement>document.getElementById(widget_id);
				if (widget) {
					widget.innerText = result[key];
				}
			}
			jQuery('#schulmanager-notenmanager-index_schulmanager-contact').css('display','inline');
		}).sendRequest(true);
	}




	/**
	 * select students for a new class changed, reload list
	 */
	onDetailsKlasseChanged(_action, _widget)
	{
		let instance = this;
		let egw = this.egw;
		this.egw.loading_prompt('schulmanager',true,egw.lang('please wait...'));
		let et2 = this.et2;
		let func = 'schulmanager.schulmanager_ui.ajax_DetailsKlasseChanged';
		let klasse_id = _widget.value;

		this.egw.json(func, [klasse_id], function (result) {
			// update schueler select
			let select_schueler = _widget.getRoot().getWidgetById('select_schueler');
			let options = [];
			for (let key in result['select_schueler']){
				options.push({value:key, label: result['select_schueler'][key]});
			}
			select_schueler.set_select_options(options);
			select_schueler.set_value(0);

			delete(result['select_schueler']);

			for (let key in result){
				if(key == 'details_noten'){
					instance.updateDetailsNoten(key, result, 'schulmanager-notenmanager-notendetails_details_noten');
				}
				else {
					let widgetItem = document.getElementById('schulmanager-notenmanager-notendetails_' + key);
					if (widgetItem) {
						widgetItem.innerText = result[key];
					}
				}
			}
			egw.loading_prompt('schulmanager',false);
		}).sendRequest(true);
	}

	/**
	 * selectes teacher for a new substitution changed, reload list
	 */
	onDetailsSchuelerChanged(_action, _senders)
	{
		let instance = this;
		//this.egw.loading_prompt('schulmanager',true,egw.lang('please wait...'));
		let et2 = this.et2;
		let func = 'schulmanager.schulmanager_ui.ajax_DetailsSchuelerChanged';
		let schueler_id = _senders.value;

		this.egw.json(func, [schueler_id], function (result) {
			for (let key in result){
				if(key == 'details_noten'){
					instance.updateDetailsNoten(key, result, 'schulmanager-notenmanager-notendetails_details_noten');
				}
				else {
					let widgetItem = document.getElementById('schulmanager-notenmanager-notendetails_' + key);
					if (widgetItem) {
						widgetItem.innerText = result[key];
					} else {
						//alert(key);
					}
				}
			}
			//egw.loading_prompt('schulmanager',false);
		}).sendRequest(true);
	}

	/**
	 * updates noten table in details view
	 * @param key
	 * @param result
	 */
	updateDetailsNoten(key, result, id_prefix)
	{
		if(key == 'details_noten'){
			for (let block in result[key]){
				for(let sIndex in result[key][block]){
					let index = parseInt(sIndex);
					if(index >= -1 && index <= 11){
						for(let col in result[key][block][index]){
							let widget_col_id = id_prefix+'['+block+']'+'['+index+']'+'['+col+']';
							let widget_col = document.getElementById(widget_col_id);
							if(widget_col){
								widget_col.innerText = result[key][block][index][col];
							}
						}
					}
				}
			}
		}
	}


	/**
	 * selectes teacher for a new substitution changed, reload list
	 */
	onDetailsNotenEdit(_action, _widget)
	{
		let idPostfix = _widget.id.substring(4)
		let isGlnw = _widget.id.substring(5, 9) == 'glnw';
		let modal = document.getElementById("schulmanager-notenmanager-notendetails_editcontentmodal");
		modal.style.display = "block";

		let widgetNote = <HTMLLabelElement>document.getElementById('schulmanager-notenmanager-notendetails_details_noten' + idPostfix + '[note]');
		if(widgetNote) {
			let note_input = <HTMLInputElement>document.getElementById('schulmanager-notenmanager-notendetails_editcontentmodal_editcontent_edit_note');
			note_input.value = widgetNote.innerText;
		}

		// select GLNW and KLNW
		let widgetTypeGKlnw = <HTMLLabelElement>document.getElementById('schulmanager-notenmanager-notendetails_details_noten' + idPostfix + '[art]');
		if(widgetTypeGKlnw){
			let selTypeGlnw = _widget.getRoot().getWidgetById('notgebart_glnw');
			let selTypeKlnw = _widget.getRoot().getWidgetById('notgebart_klnw');

			if(isGlnw) {
	/*			for (let i = 0; i < selTypeGlnw.sel_options.length; i++) {
					if (selTypeGlnw.sel_options[i].innerText.trim() == widgetTypeGKlnw.value) {
						selTypeGlnw.set_value(i);
						break;
					}
				}
	*/
				selTypeGlnw.style.display = "block";
				selTypeKlnw.set_value(0);
				selTypeKlnw.style.display = "none";

				// update style
				jQuery(".details-grid-edit tr:nth-child(even)").css("background", "#fff9ba");
				jQuery(".details-grid-edit tr:nth-child(odd)").css("background", "#fff47c");
				jQuery(".details-grid-edit td").css("border", "1px solid #ffdd00");
				// end update style
			}
			else {
	/*			for (let i = 0; i < selTypeKlnw.menuItems.length; i++) {
					if(selTypeKlnw.menuItems[i].innerText.trim() == widgetTypeGKlnw.value){
						selTypeKlnw.set_value(i);
						break;
					}
				}
	*/
				selTypeGlnw.set_value(0);
				selTypeGlnw.style.display = "none";
				selTypeKlnw.style.display = "block";

				// update style
				jQuery(".details-grid-edit tr:nth-child(even)").css("background", "#beeaac");
				jQuery(".details-grid-edit tr:nth-child(odd)").css("background", "#a1e684");
				jQuery(".details-grid-edit td").css("border", "1px solid #7ecc67");
				// end update style
			}
			document.getElementById('schulmanager-notenmanager-notendetails_edit_type_flag').innerText = isGlnw ? "glnw" : "klnw";
		}
		// definition date
		let widgetDefDate = <HTMLLabelElement>document.getElementById('schulmanager-notenmanager-notendetails_details_noten' + idPostfix + '[definition_date]');
		if(widgetDefDate){
			let defDate_input = <HTMLInputElement> document.getElementById('schulmanager-notenmanager-notendetails_editcontentmodal_editcontent_edit_date');
			defDate_input.value = widgetDefDate.innerText;
		}
		// description
		let widgetDesc = <HTMLLabelElement>document.getElementById('schulmanager-notenmanager-notendetails_details_noten' + idPostfix + '[description]');
		if(widgetDesc){
			let desc_input = <HTMLInputElement> document.getElementById('schulmanager-notenmanager-notendetails_editcontentmodal_editcontent_edit_desc');
			desc_input.value = widgetDesc.innerText;
		}

		// note kaay
		let note_key = <HTMLInputElement>document.getElementById('schulmanager-notenmanager-notendetails_edit_note_key');
		note_key.value = idPostfix;
	}

	/**
	 * Commits edited noten value
	 * @param _action
	 * @param _senders
	 */
	onDetailsNotenCommit(_action, _widget)
	{
		let egw = this.egw;
		let instance = this;
		this.egw.loading_prompt('schulmanager',true,egw.lang('please wait...'));
		// read data
		let noteElement = <HTMLInputElement>document.getElementById('schulmanager-notenmanager-notendetails_editcontentmodal_editcontent_edit_note');
		let noteVal = noteElement.value;

		let typeFlagElement = document.getElementById('schulmanager-notenmanager-notendetails_edit_type_flag');
		let typeFlag = typeFlagElement.innerText;

		let note_type = "0";

		if(typeFlag == "glnw"){
			let selTypeGlnw = _widget.getRoot().getWidgetById('notgebart_glnw');
			//let selTypeGlnw = <Et2Select>document.getElementById('schulmanager-notenmanager-notendetails_editcontentmodal_editcontent_notgebart_glnw');
			note_type = selTypeGlnw.value;

		}
		else if(typeFlag == "klnw"){
			let selTypeKlnw = _widget.getRoot().getWidgetById('notgebart_klnw');
			//let selTypeKlnw = <Et2Select>document.getElementById('schulmanager-notenmanager-notendetails_editcontentmodal_editcontent_notgebart_klnw');
			note_type = selTypeKlnw.value;
		}

		let dateElement = _widget.getRoot().getWidgetById('edit_date');
		//let dateElement = <Et2Date> document.getElementById('schulmanager-notenmanager-notendetails_editcontentmodal_editcontent_edit_date');
		let note_date = dateElement.value;

		let descElement = <HTMLInputElement> document.getElementById('schulmanager-notenmanager-notendetails_editcontentmodal_editcontent_edit_desc');
		let note_desc = descElement.value;

		let tokenElement = <HTMLInputElement> document.getElementById('schulmanager-notenmanager-notendetails_token');
		let token = tokenElement.value;

		let noteKeyElement = <HTMLInputElement> document.getElementById('schulmanager-notenmanager-notendetails_edit_note_key');
		let noteKey = noteKeyElement.value

		// send data
		let func = 'schulmanager.schulmanager_ui.ajax_noteDetailsModified';

		this.egw.json(func, [noteKey, noteVal, token, note_date, note_type, note_desc, typeFlag], function (result) {
			//alert("done");
			for (let key in result){
				if(key == 'details_noten'){
					instance.updateDetailsNoten(key, result, 'schulmanager-notenmanager-notendetails_details_noten');
				}
				else {

					let widgetItem = document.getElementById('schulmanager-notenmanager-notendetails_' + key);
					if (widgetItem) {
						widgetItem.innerText = result[key];
					} else {
						//alert(key);
					}
				}
			}
			egw.loading_prompt('schulmanager',false);
		}).sendRequest(true);

		// hide div
		let modal = document.getElementById("schulmanager-notenmanager-notendetails_editcontentmodal");
		modal.style.display = "none";
	}

	onDetailsNotenCancel(_action, _senders)
	{
		let modal = document.getElementById("schulmanager-notenmanager-notendetails_editcontentmodal");
		modal.style.display = "none";
	}

	/**
	 * Delete single
	 * @param _action
	 * @param _senders
	 */
	onDetailsNotenDelete(_action, _senders)
	{
		let instance = this;
		let egw = this.egw;

		let tokenElement = <HTMLInputElement> document.getElementById('schulmanager-notenmanager-notendetails_token');
		let token = tokenElement.value;

		let noteKeyElement = <HTMLInputElement> document.getElementById('schulmanager-notenmanager-notendetails_edit_note_key');
		let noteKey = noteKeyElement.value
		//var modal = document.getElementById("schulmanager-notenmanager-notendetails_editcontentmodal");
		//modal.style.display = "none";

		let action_id = _action.id;
		et2_dialog.show_dialog(function(button_id,value)
		{
			if (button_id != et2_dialog.NO_BUTTON)
			{
				let func = 'schulmanager.schulmanager_ui.ajax_noteDetailsDeleted';

				egw.json(func, [noteKey, token], function (result) {
					for (let key in result){
						if(key == 'details_noten'){
							instance.updateDetailsNoten(key, result, 'schulmanager-notenmanager-notendetails_details_noten');
						}
						else {
							let widgetItem = document.getElementById('schulmanager-notenmanager-notendetails_' + key);
							if (widgetItem) {
								widgetItem.innerText = result[key];
							} else {

							}
						}
					}

				}).sendRequest(true);
			}

		}, egw.lang('Confirmation required'), egw.lang('Confirmation required'), {}, et2_dialog.BUTTONS_OK_CANCEL, et2_dialog.QUESTION_MESSAGE);

		let modal = document.getElementById("schulmanager-notenmanager-notendetails_editcontentmodal");
		modal.style.display = "none";
	}

	/**
	 * select students for a new class changed, reload list
	 * @param _action
	 * @param _senders
	 */
	onSchuelerViewKlasseChanged(_action, _widget)
	{
		let instance = this;
		let et2 = this.et2;
		let func = 'schulmanager.schulmanager_ui.ajax_schuelerViewKlasseChanged';
		let klasse_id = 0;
		let egw = this.egw;

		if(_widget !== null){
			klasse_id = _widget.value;
		}

		this.egw.json(func, [klasse_id], function (result) {
			if(_widget !== null) {
				let select_schueler = _widget.getRoot().getWidgetById('select_schueler');
				let options = [];
				for (let key in result['select_schueler']){
					options.push({value:key, label: result['select_schueler'][key]});
				}
				select_schueler.set_select_options(options);
				select_schueler.set_value(0);
			}
			delete(result['select_schueler']);
			instance.schuelerViewUpdate(instance, result);
		}).sendRequest(true);
	}

	/**
	 * select students for a new class changed, reload list
	 */
	onSchuelerViewSchuelerChanged(_action, _senders) {
		let instance = this;
		let et2 = this.et2;
		let func = 'schulmanager.schulmanager_ui.ajax_schuelerViewSchuelerChanged';
		let schueler_id = _senders.value;
		this.egw.json(func, [schueler_id], function (result) {
			instance.schuelerViewUpdate(instance, result);
		}).sendRequest(true);
	}

	/**
	 * updates nested content
	 * @param instance
	 * @param result
	 */
	schuelerViewUpdate(instance, result){
		// ############### new version
		instance.tableUpdate("schulmanager-schuelerview_grid-sla", result['sla_nm_rows']);
		instance.tableUpdate("schulmanager-schuelerview_grid-sko", result['sko_nm_rows']);
		instance.tableUpdate("schulmanager-schuelerview_grid-san", result['san_nm_rows']);
		instance.tableUpdate("schulmanager-schuelerview_not_nm", result['noten_nm_rows']);
		// ################

		for (let key in result){
			if(key != 'sla_nm_rows' && key != 'sko_nm_rows' && key != 'san_nm_rows'){
				let widgetItem = document.getElementById('schulmanager-schuelerview_' + key);
				if (widgetItem) {
					widgetItem.innerText = result[key];
				}
			}
		}

		// select in modal div
		let selGefaehrdung = <Et2Select>document.getElementById('schulmanager-schuelerview_zzeditmodal_zzeditcontent_select_zz_gefaehrdung');
		selGefaehrdung.set_value(result['zz_gefaehrdung_id']);

		let zzAbweis = <Et2Checkbox> document.getElementById('schulmanager-schuelerview_zzeditmodal_zzeditcontent_zzabweis');
		zzAbweis.checked = result['zz_abweisung'];
	}

	/**
	 * appends a new row
	 * @param id
	 * @param row
	 */
	tableUpdate(id, rows){
		let table = <HTMLTableElement>document.getElementById(id);

		// delete rows
		while(table.rows.length > 1) {
			table.deleteRow(1);
		}

		// add new rows
		if(table){
			for (let r = 0; r < rows.length; r++) {
				let newRow = table.insertRow(table.rows.length);
				let rowData = rows[r];
				for (let i = 0; i < rowData.length; i++) {
					let cell = newRow.insertCell(i);
					cell.innerHTML = rowData[i];
				}
			}
		}
	}


	/**
	 * Search accounts to map them to teachers
	 */
	onTeacherAutoLinking(_action, _senders) {
		let et2 = this.et2;
		let func = 'schulmanager.schulmanager_substitution_ui.ajax_onTeacherAutoLinking';

		this.egw.json(func, [], function (result) {
			let nm = <et2_nextmatch>et2.getWidgetById('nm');
			nm.applyFilters();
		}).sendRequest(true);

	}

	/**
	 * reset all linked accounts
	 * @param _action
	 * @param _senders
	 */
	onTeacherResetLinking(_action, _senders) {
		let et2 = this.et2;
		let func = 'schulmanager.schulmanager_substitution_ui.ajax_onTeacherResetLinking';

		this.egw.json(func, [], function (result) {
			let nm = <et2_nextmatch>et2.getWidgetById('nm');
			nm.applyFilters();
		}).sendRequest(true);
	}

	/**
	 * Before linking teacher to egw account
	 * @param _action
	 * @param _senders
	 */
	onTeacherAccountLinkEdit(_action, _senders)
	{
		let row_id = _senders[0]._index;
		let func = 'schulmanager.schulmanager_substitution_ui.ajax_onTeacherAccountLinkEdit';

		this.egw.json(func, [row_id], function (result) {
			let modal = document.getElementById("schulmanager-accounts_editcontentmodal");
			modal.style.display = "block";

			delete(result['link_account_id']);

			for (let key in result){
				let widget_id = 'schulmanager-accounts_editcontentmodal_editcontent_' + key;
				let widget = <HTMLInputElement>document.getElementById(widget_id);
				if (widget) {
					widget.innerText = result[key];
				}
			}
		}).sendRequest(true);
	}

	/**
	 * Commit teacher-account-link
	 * @param _action
	 * @param _senders
	 */
	onTeacherAccountLinkCommit(_action, _senders)
	{
		let modal = document.getElementById("schulmanager-accounts_editcontentmodal");
		modal.style.display = "none";

		let et2 = this.et2;
		let selAccount = <HTMLSelectElement>document.getElementById('schulmanager-accounts_editcontentmodal_editcontent_account_id');
		let account = selAccount.value;
		let tokenDiv = <HTMLInputElement> document.getElementById('schulmanager-accounts_token');
		let token = tokenDiv.value;

		let func = 'schulmanager.schulmanager_substitution_ui.ajax_onTeacherAccountLinkCommit';

		this.egw.json(func, [account, token], function (result) {
			let nm = <et2_nextmatch>et2.getWidgetById('nm');
			nm.refresh(result['row_index'], et2_nextmatch.UPDATE);
		}).sendRequest(true);

	}

	/**
	 * Reset single row, delete teacher-account-link
	 * @param _action
	 * @param _senders
	 */
	onTeacherAccountLinkReset(_action, _senders)
	{
		let et2 = this.et2;

		let row_ids = [];
		for (let i = 0; i < _senders.length; i++) {
			row_ids.push(_senders[i]._index);
		}

		//var row_id = _senders[0]._index;
		let tokenDiv = <HTMLInputElement> document.getElementById('schulmanager-accounts_token');
		let token = tokenDiv.value;
		let func = 'schulmanager.schulmanager_substitution_ui.ajax_onTeacherAccountLinkReset';

		this.egw.json(func, [row_ids, token], function (result) {
			let nm = <et2_nextmatch>et2.getWidgetById('nm');
			//nm.refresh(result['row_id'], et2_nextmatch.UPDATE);
			nm.applyFilters();
		}).sendRequest(true);
	}

	delLnwPerA(){
		let et2 = this.et2;
		let egw = this.egw;
		let tokenDiv = <HTMLInputElement> document.getElementById('schulmanager-schuelerview_token');
		let token = tokenDiv.value;
		et2_dialog.show_dialog(function(button_id,value)
		{
			if (button_id == et2_dialog.OK_BUTTON)
			{
				egw.loading_prompt('schulmanager',true,egw.lang('please wait...'));
				let func = 'schulmanager.schulmanager_ui.ajax_delLnwPerA';
				egw.json(func, [token], function (result) {
					let not_nm = <et2_nextmatch>et2.getWidgetById('not_nm');
					not_nm.applyFilters();
				}).sendRequest(true);
				egw.loading_prompt('schulmanager',false);
			}

		}, egw.lang('Confirmation required'), egw.lang('Confirmation required'), {}, et2_dialog.BUTTONS_OK_CANCEL, et2_dialog.QUESTION_MESSAGE);
	}

	delLnwPerB(){
		let et2 = this.et2;
		let egw = this.egw;
		let tokenDiv = <HTMLInputElement> document.getElementById('schulmanager-schuelerview_token');
		let token = tokenDiv.value;
		et2_dialog.show_dialog(function(button_id,value)
		{
			if (button_id == et2_dialog.OK_BUTTON)
			{
				let func = 'schulmanager.schulmanager_ui.ajax_delLnwPerB';
				egw.json(func, [token], function (result) {
				}).sendRequest(true);
			}
			let not_nm = <et2_nextmatch>et2.getWidgetById('not_nm');
			not_nm.applyFilters();
		}, egw.lang('Confirmation required'), egw.lang('Confirmation required'), {}, et2_dialog.BUTTONS_OK_CANCEL, et2_dialog.QUESTION_MESSAGE);
		//var modal = document.getElementById("schulmanager-notenmanager-notendetails_editcontentmodal");
		//modal.style.display = "none";
	}

	resetAllGrades(){
		let et2 = this.et2;
		let tokenDiv = <HTMLInputElement> document.getElementById('schulmanager-mntc_token');
		let token = tokenDiv.value;

		et2_dialog.show_prompt(function(button_id, value){
			if (button_id == et2_dialog.OK_BUTTON)
			{
				let func = 'schulmanager.schulmanager_mntc_ui.ajax_resetAllGrades';
				egw.json(func, [token, value], function (result) {
					if(result.error_msg){
						egw(window).message(result.error_msg, 'error');
					}
					egw(window).message(result.msg, 'success');
				}).sendRequest(true);
			}
		}, egw.lang('Confirmation required'), egw.lang('Absolut sicher, dass alle Noten gelöscht werden sollen?'), {}, et2_dialog.BUTTONS_OK_CANCEL, et2_dialog.QUESTION_MESSAGE);
	}

	/**
	 *
	 * @param action
	 * @param widget
	 */
	onNotGebArtChanged(action, widget){
		let index = widget.getValue();
		let readonlyKLNW = index == 0;
		this.toggleEditGradesInput(readonlyKLNW);
	}

	toggleEditGradesInput(readonlyKLNW){
		for(let row = 1; row <= 40; row++){
			for(let i = 0; i < 12; i++){
				let inputItem1 = <HTMLInputElement>document.getElementById('schulmanager-notenmanager-edit_' + row + '[noten][klnw_hj_1][' + i + '][note]');
				if(!inputItem1){
					return;	// no more lines
				}
				let inputItem2 = <HTMLInputElement>document.getElementById('schulmanager-notenmanager-edit_' + row + '[noten][klnw_hj_2][' + i + '][note]');
				if(readonlyKLNW){
					inputItem1.readOnly = true;
					inputItem2.readOnly = true;
				}
				else{
					inputItem1.removeAttribute("readonly");
					inputItem2.removeAttribute("readonly");
				}
			}
			for(let i = 0; i < 3; i++){
				let inputItem1 = <HTMLInputElement>document.getElementById('schulmanager-notenmanager-edit_' + row + '[noten][glnw_hj_1][' + i + '][note]');
				let inputItem2 = <HTMLInputElement>document.getElementById('schulmanager-notenmanager-edit_' + row + '[noten][glnw_hj_2][' + i + '][note]');
				if(readonlyKLNW){
					inputItem1.removeAttribute("readonly");
					inputItem2.removeAttribute("readonly");
				}
				else{
					inputItem1.readOnly = true;
					inputItem2.readOnly = true;
				}
			}
		}
	}
}

app.classes.schulmanager = SchulmanagerApp;