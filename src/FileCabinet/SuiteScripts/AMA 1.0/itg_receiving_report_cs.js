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
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function CS_Print(id,type,CType){
	if (id != '') {
		var url = nlapiResolveURL('suitelet', 'customscript_itg_receiving_report_sl', 'customdeploy_itg_receiving_report_sl');
			url += '&id=' + id;
			url += '&ttype=' + type;
			url += '&CType=' + CType;
		window.open(url,'_blank');
		
		
	}else{
		alert('Error');
	}
}
