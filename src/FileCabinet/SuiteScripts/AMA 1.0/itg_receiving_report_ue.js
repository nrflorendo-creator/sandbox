/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Apr 2020     Algen Esturas
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request){
	var ctx 		= nlapiGetContext().getExecutionContext();
	var id 			= nlapiGetRecordId();
	var rectype 	= nlapiGetRecordType();
	var currUser 	= nlapiGetUser();
	//var currsub 	= nlapiGetSubsidiary(); 
	var currsub 	= nlapiGetFieldValue('subsidiary');
	var status      = nlapiGetFieldValue('approvalstatus');
	

	
	if ((type == 'view' || type == 'edit') && ctx == 'userinterface') {
	//if ((type == 'view' || type == 'edit' || type == 'create') && ctx == 'userinterface') {

		switch(rectype){

	  		case ('itemreceipt'):
	  		//if(currsub == 1){
	  			form.addButton('custpage_btn_print_rr', 'Print RR',"CS_Print('"+id+"','"+rectype+"','RR')");
	  		//}
	  		break;

		}
		
		form.setScript('customscript_itg_receiving_report_cs');

	}
}
