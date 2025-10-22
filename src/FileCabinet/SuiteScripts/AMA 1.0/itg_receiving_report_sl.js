/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Apr 2020     Algen Esturas
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	if (request.getMethod() == 'GET') {
		var ID 			= request.getParameter('id');
		var TType 		= request.getParameter('ttype');
		var CType 		= request.getParameter('CType');
		var layout;

		switch(TType) {
	
		  case('itemreceipt'):
		  	layout 		= GeneratePDFRR(ID,TType);
		  	break;
		  
		}

		var file 		= nlapiXMLToPDF(layout);
		response.setContentType('PDF', TType+ID+'.pdf', 'inline');
		response.write(file.getValue());
		return;
	}
}

//Generate Receiving Report
function GeneratePDFRR(id,type){
	var xml 		= '';
	var xmldet 		= '';

	//Header Company Details
	var rec 		= nlapiLoadRecord(type, id);
	var currsub 		= catchIsNaN(rec.getFieldValue('subsidiary')); 
	var rec2 			= nlapiLoadRecord('subsidiary',currsub);
	var CompanyName 	= catchNull(nlapiEscapeXML(rec2.getFieldValue('legalname')));
	var CompanyAddress 	= catchNull(nlapiEscapeXML(rec2.getFieldValue('mainaddress_text')));
	//End Details
	
	var Date 		= catchNull(rec.getFieldValue('trandate'));
	var RRNo 		= catchNull(rec.getFieldValue('tranid'));
	var Remarks 	= catchNull(nlapiEscapeXML(rec.getFieldValue('custbody9')));
	var SupplierID 	= catchNull(nlapiEscapeXML(rec.getFieldValue('entity')));
	var SupplierName 	= catchNull(nlapiEscapeXML(rec.getFieldText('entity')));
	var PONoID 			= catchIsNaN(rec.getFieldValue('createdfrom'));
	var OrderType 		= catchNull(rec.getFieldValue('ordertype'));
	var IFID 		= catchNull(rec.getFieldValue('itemfulfillment'));
	var location 	= catchNull(rec.getFieldText('location'));
	var currencySymbol 	= catchNull(rec.getFieldValue('currencysymbol'));
	
	//Get Received By
	var ReceivedBy 	= catchNull(rec.getFieldText('custbodyemployee_id'));
	var AuditedBy 	= catchNull(rec.getFieldText('custbody25'));
	//End
	
	var DRNo = '';
	var DRDate = '';

	//Get DR Details from Item Fulfillment
	if(IFID){
		var rec3 = nlapiLoadRecord('itemfulfillment', IFID);
		
		DRNo 	= catchNull(rec3.getFieldValue('tranid'));
		DRDate 	= catchNull(rec3.getFieldValue('trandate'));
	}
	//End
	
	//var rec2 = nlapiLoadRecord('vendor', SupplierID);
	var SupplierAddress = catchNull(nlapiEscapeXML(get_Address(SupplierID)));
	//nlapiLogExecution('DEBUG', 'Address', SupplierAddress)
	
	//Get Image
	var companyHeader 	= switchImg(currsub);
	//nlapiLogExecution('DEBUG','comheader',companyHeader);
	
	var fileHeader = '';
	try{
		fileHeader 		= nlapiLoadFile(companyHeader).getURL();	
	}
	catch(e){
		
	}
	//End Get Image
	
	//Get PO details
	var PONo = '';
	
	if(OrderType == 'PurchOrd'){
		var PONoID 	= catchIsNaN(rec.getFieldValue('createdfrom'));
		PONo 		= catchNull(nlapiLookupField('purchaseorder',PONoID,'tranid'));
		nlapiLogExecution('DEBUG', 'POdebug', PONoID);
		
		//Get DR Details
		DRNo 		= catchNull(rec.getFieldValue('custbody18'));
		DRDate 		= catchNull(rec.getFieldValue('custbody19'));
		
	}
	//End
	
	//Get Item details
	// Get Item details
var ItemDesc = '';
var TotalQty = 0;
var TotalAmount = 0;

// Load PO record if createdfrom is available
var poRec = null;
if (OrderType == 'PurchOrd' && PONoID) {
	try {
		poRec = nlapiLoadRecord('purchaseorder', PONoID);
	} catch (e) {
		nlapiLogExecution('ERROR', 'Failed to load PO', e.toString());
	}
}

for (var x = 1; x <= rec.getLineItemCount('item'); x++) {

	var ItemId = rec.getLineItemValue('item', 'item', x);
	var ItemType = rec.getLineItemValue('item', 'itemtype', x);

	var Qty = parseFloat(catchNull(rec.getLineItemValue('item', 'quantity', x))) || 0;
	var Units = catchNull(nlapiEscapeXML(rec.getLineItemValue('item', 'unitsdisplay', x)));
	var Rate = parseFloat(catchIsNaN(rec.getLineItemValue('item', 'rate', x))) || 0;

	var ItemCode = catchNull(nlapiLookupField('item', ItemId, 'itemid'));
	ItemDesc = catchNull(nlapiEscapeXML(rec.getLineItemValue('item', 'description', x)));
	var ItemDisplay = catchNull(nlapiLookupField('item', ItemId, 'displayname'));

	// Always get the correct rate from PO if item type is NonInvtPart, OtherCharge, or Service
	if ((ItemType === 'NonInvtPart' || ItemType === 'OtherCharge' || ItemType === 'Service') && poRec) {
		for (var y = 1; y <= poRec.getLineItemCount('item'); y++) {
			var poItemId = poRec.getLineItemValue('item', 'item', y);
			var poQty = parseFloat(poRec.getLineItemValue('item', 'quantity', y)) || 0;
			var poItemDesc = catchNull(nlapiEscapeXML(poRec.getLineItemValue('item', 'description', y)));

			// Match by item ID and quantity
			nlapiLogExecution('DEBUG', 'description', "ItemDesc: "+ ItemDesc +" &&&&& "+ "poItemDesc: "+ poItemDesc);
			nlapiLogExecution('DEBUG', 'condition', poItemId +"==="+ ItemId +"&&"+ poQty +"==="+ Qty);
			if (poItemId === ItemId && poQty === Qty && poItemDesc === ItemDesc) {
				Rate = parseFloat(poRec.getLineItemValue('item', 'rate', y)) || 0;
				break;
			}
		}
	}

	var Amount = Qty * Rate;
	TotalQty += Qty;
	TotalAmount += Amount;

	// Append to xmldet for IR printing
	xmldet += "<tr>";
	xmldet += "<td align='left' class='brdr-left brdr-bottom valign-t'>" + ItemCode + "</td>";
	xmldet += "<td align='left' class='brdr-left brdr-bottom valign-t' style='width:3in;word-break:break-word'>" + ItemDesc + "</td>";
	xmldet += "<td align='right' class='brdr-left brdr-bottom valign-t'>" + toCurrency(Qty) + "</td>";
	xmldet += "<td align='right' class='brdr-left brdr-bottom valign-t'>" + Units + "</td>";
	xmldet += "<td align='right' class='brdr-left brdr-bottom valign-t'><span style='font-weight: bold'>" + currencySymbol + " </span><span>" + toCurrency(Rate) + "</span></td>";
	xmldet += "<td align='right' class='brdr-left brdr-bottom brdr-right valign-t'><span style='font-weight: bold'>" + currencySymbol + " </span><span>" + toCurrency(Amount) + "</span></td>";
	xmldet += "</tr>";
}

	try{
		
			
		 	xml = "<pdf>";
					xml += "<head>";
						xml += "<style>";
							xml += ".txt-justify{";
								xml += "text-align:justify;";
								xml += "text-justify: inter-word;";
								xml += "word-break: break-all;";
							xml += "}";

							xml += ".header{";
								xml += "width:100%;";
								//xml += "margin-top:0.4in;";
								xml += "table-layout:fixed;";
							xml += "}";
							xml += ".ftr{";
								xml += "width:100%;";
								xml += "margin-top:0in;";
								xml += "table-layout:fixed;";
							xml += "}";

							xml += ".subheader1{";
								xml += "width:100%;";
								//xml += "margin-top:0.6in;";
								xml += "table-layout:fixed;";
							xml += "}";

							xml += ".subheader2{";
								xml += "width:100%;";
								xml += "margin-top:0.5in;";
								xml += "table-layout:fixed;";
							xml += "}";

							xml += ".details{";
								xml += "width:100%;";
								xml += "margin-top:0.1in;";
								xml += "table-layout:fixed;";

							xml += "}";

							xml += ".details td{";
								//xml += "border-right:1px solid #000;";
								//xml += "border-bottom:1px solid #000;";
								xml += "padding:0.05in;";
								
							xml += "}";

							xml += ".details th{";
								xml += "font-weight: bold";
								xml += "font-size: 12pt";
								xml += "vertical-align: middle";
								xml += "padding: 5px 6px 3px";
								xml += "background-color: #e3e3e3";
								xml += "color: #333333";
							xml += "}";

							xml += ".BranchHeader td{";
								xml += "background-color:#f20c49;";
								xml += "font-weight:bold;";
							xml += "}";

							xml += ".BranchFooterGT td{";
								xml += "background-color:#e3e3e3;";
								xml += "font-weight:bold;";
							xml += "}";

							xml += ".details2{";
								xml += "width:100%;";
								xml += "margin-top:0.6in;";
								xml += "table-layout:fixed;";

							xml += "}";

							xml += ".details2 td,th{";
								//xml += "border-right:1px solid #000;";
								//xml += "border-bottom:1px solid #000;";
								xml += "padding:0.05in;";
								
							xml += "}";

							xml += ".details2 th{";
								xml += "background-color:#e3e3e3;";
								xml += "font-weight:bold;";
							xml += "}";

							xml += ".brdr-top{";
								xml += "border-top:1px solid #000;";
							xml += "}";
							xml += ".brdr-left{";
								xml += "border-left:1px solid #000;";
							xml += "}";

							xml += ".brdr-right{";
								xml += "border-right:1px solid #000;";
							xml += "}";

							xml += ".brdr-bottom{";
								xml += "border-bottom:1px solid #000;";
							xml += "}";

							xml += ".valign-b{";
								xml += "vertical-align:bottom;";
							xml += "}";
							xml += ".valign-t{";
								xml += "vertical-align:top;";
							xml += "}";
							xml += ".valign-m{";
								xml += "vertical-align:middle;";
							xml += "}";
								
							
			
						xml += "</style>";

						
						xml += "<macrolist>";
							xml += '<macro id="nlheader">';
								//Header
								xml += "<div>";
									xml += "<table margin-top='-0.3in' class='header' style='font-size:8pt;'>";
										
										xml += "<tr>";
											xml += "<td rowspan='2' style='width:3in' align='right' class='valign-t'>";
												xml += "<img style='width:150;height: 100;' valign='middle' src=\"" + nlapiEscapeXML(getSysURL() + fileHeader) + "\"> </img>";
											xml += "</td>";
											xml += "<td class='valign-b' style='width:2.7in'>";
												xml += "<span style='font-size:12pt;font-weight:bold'>"+ CompanyName +"</span>";
											xml += "</td>";
											
										xml += "</tr>";
										
										xml += "<tr>";
											xml += "<td class='valign-t'>";
												xml += "<span>"+ preFormat(CompanyAddress) +"</span>";
											xml += "</td>";
										xml += "</tr>";
										
										xml += "<tr>";
											xml += "<td>";
												xml += "<span></span>";
											xml += "</td>";
											xml += "<td>";
												xml += "<span style='padding-left:0in'></span>";
											xml += "</td>";
										xml += "</tr>";
						
									xml += "</table>";

									xml += "<table class='header' style='margin-top:0.05in'>";
										xml += "<tr>";
											xml += "<td class='valign-m' align='center'>";
												xml += "<span style='font-size:15pt;font-weight:bold'>RECEIVING REPORT</span>";
											xml += "</td>";
										xml += "</tr>";
									xml += "</table>";
									
									xml += "<table cellspacing='0' class='header' style='font-size:8pt;margin-top: 0.1in'>";
										
										xml += "<tr>";
											xml += "<td class='' style='width: 0.8in'>";
												xml += "<span style='font-weight: bold;'>Vendor:</span>";
											xml += "</td>";	
											xml += "<td class='' style='width: 3in'>";
												xml += "<span>"+ SupplierName +"</span>";
											xml += "</td>";
											xml += "<td class='' style='width: 0.8in'>";
												xml += "<span style='font-weight: bold;'>Receiving Report No.:</span>";
											xml += "</td>";	
											xml += "<td class='' style='width: 1in'>";
												xml += "<span>"+ RRNo +"</span>";
											xml += "</td>";
										xml += "</tr>";
										
										xml += "<tr>";
											xml += "<td class='' style='width: 0.5in'>";
												xml += "<span style='font-weight: bold;'>Address:</span>";
											xml += "</td>";	
											xml += "<td class='' style='width: 3in'>";
												xml += "<span>"+ SupplierAddress +"</span>";
											xml += "</td>";
											xml += "<td class='' style='width: 0.5in'>";
												xml += "<span style='font-weight: bold;'>Date Received:</span>";
											xml += "</td>";	
											xml += "<td class='' style='width: 1in'>";
												xml += "<span>"+ Date +"</span>";
											xml += "</td>";
										xml += "</tr>";
										
										xml += "<tr>";
											xml += "<td class='' style='width: 0.5in'>";
												xml += "<span style='font-weight: bold;'>Purchase Order No.:</span>";
											xml += "</td>";	
											xml += "<td class='' style='width: 3in'>";
												xml += "<span>"+ PONo +"</span>";
											xml += "</td>";
											xml += "<td class='' style='width: 0.5in'>";
												xml += "<span style='font-weight: bold;'>Operating Unit:</span>";
											xml += "</td>";	
											xml += "<td class='' style='width: 1in'>";
												xml += "<span>"+ CompanyName +"</span>";
											xml += "</td>";
										xml += "</tr>";
										
										xml += "<tr>";
											xml += "<td class='' style='width: 0.5in'>";
												xml += "<span style='font-weight: bold;'>Delivery Receipt No.:</span>";
											xml += "</td>";	
											xml += "<td class='' style='width: 3in'>";
												xml += "<span>"+ DRNo +"</span>";
											xml += "</td>";
											xml += "<td class='' style='width: 0.5in'>";
												xml += "<span style='font-weight: bold;'>Inventory Site:</span>";
											xml += "</td>";	
											xml += "<td class='' style='width: 1in'>";
												xml += "<span>"+ location +"</span>";
											xml += "</td>";
										xml += "</tr>";
										
										xml += "<tr>";
											xml += "<td class='' style='width: 0.5in'>";
												xml += "<span style='font-weight: bold;'>Delivery Receipt Date:</span>";
											xml += "</td>";	
											xml += "<td class='' style='width: 3in'>";
												xml += "<span>"+ DRDate +"</span>";
											xml += "</td>";
											xml += "<td class='' style='width: 0.5in'>";
												xml += "<span style='font-weight: bold;'></span>";
											xml += "</td>";	
											xml += "<td class='' style='width: 1in'>";
												xml += "<span>"+ '' +"</span>";
											xml += "</td>";
										xml += "</tr>";
										
									xml += "</table>";
								xml += "</div>";

							xml += '</macro>';

							xml += '<macro id="nlfooter">';
								xml += "<table class='header' style='font-size:8pt'>";
									xml += "<tr>";
										xml += "<td class='brdr-left brdr-top brdr-bottom' style='width: 5in'>";
											xml += "<span style='font-weight: bold'></span>";
										xml += "</td>";
										xml += "<td align='center' style='width: 1.2in;' class='brdr-top brdr-bottom'>";
											xml += "<span style='font-weight: bold'>Grand Total (Amount):</span>";
										xml += "</td>";
										xml += "<td align='right' style='width: 1in;' class='brdr-top brdr-bottom brdr-right'>";
											xml += "<span style='font-weight: bold'>"+ currencySymbol + ' ' + toCurrency(TotalAmount) +"</span>";
										xml += "</td>";
									xml += "</tr>";
									
									
									
								xml += "</table>";
								
								xml += "<table class='header' style='font-size:8pt' margin-top='0.1in'>";
									
									xml += "<tr>";
										xml += "<td colspan='2' class='brdr-left brdr-top brdr-right'>";
											xml += "<span style='font-weight: bold'>Remarks:</span>";
										xml += "</td>";
									xml += "</tr>";
									xml += "<tr style='height: 0.5in'>";
										xml += "<td colspan='2' class='brdr-left brdr-top brdr-right'>";
											xml += "<span>"+ Remarks +"</span>";
										xml += "</td>";
									xml += "</tr>";
								
									xml += "<tr>";
										xml += "<td class='brdr-left brdr-top'>";
											xml += "<span style='font-weight: bold'>Received By:</span>";
										xml += "</td>";
										xml += "<td class='brdr-left brdr-top brdr-right'>";
											xml += "<span style='font-weight: bold'>Audited By:</span>";
										xml += "</td>";
									xml += "</tr>";
								 	xml += "<tr style='height:0.3in'>";
										xml += "<td class='brdr-left brdr-top brdr-bottom'>";
											xml += "<span>"+ ReceivedBy +"</span>";
										xml += "</td>";
										xml += "<td class='brdr-left brdr-top brdr-right brdr-bottom'>";
											xml += "<span>"+ AuditedBy +"</span>";
										xml += "</td>";
									xml += "</tr>";
									
								xml += "</table>";
								
							xml += "</macro>";

						xml += "</macrolist>";
						
					xml += "</head>";

					xml += "<body padding-left='0.3in' padding-right='0.3in' header='nlheader' header-height='2.8in' footer='nlfooter' footer-height='1.3in' width='8.2in' height='6.5in' font-family='Arial, Helvetica, sans-serif'>";
					//xml += "<body padding-left='0.2in' header='nlheader' header-height='2in' footer='nlfooter' footer-height='4.4in' size='A4' font-family='Arial, Helvetica, sans-serif'>";
					//xml += "<body size='letter' font-family='Arial, Helvetica, sans-serif'>";
						
						//Header
						xml += "<table class='details' style='font-size:8pt;'>";
							xml += "<thead>";
																	
								xml += "<tr>";
								
									xml += "<td align='center' class='brdr-left brdr-top brdr-bottom' style='font-weight:bold; width:1in'>";
										xml += "<span>Item Code</span>";
									xml += "</td>";
									xml += "<td align='center' class='brdr-left brdr-top brdr-bottom' style='font-weight:bold; width:3in'>";
										xml += "<span>Description</span>";
									xml += "</td>";
									xml += "<td align='center' class='brdr-left brdr-top brdr-bottom' style='font-weight:bold; width:0.5in'>";
										xml += "<span>Quantity</span>";
									xml += "</td>";
									xml += "<td align='center' class='brdr-left brdr-top brdr-bottom' style='font-weight:bold; width:0.5in'>";
										xml += "<span>UOM</span>";
									xml += "</td>";
									xml += "<td align='center' class='brdr-left brdr-top brdr-bottom' style='font-weight:bold; width:1in'>";
										xml += "<span>Unit Cost</span>";
									xml += "</td>";
									xml += "<td align='center' class='brdr-left brdr-top brdr-right brdr-bottom' style='font-weight:bold; width:1in'>";
										xml += "<span>Total</span>";
									xml += "</td>";
								
									
								xml += "</tr>";
							xml += "</thead>";
								//Items Loop TR
							xml += "<tbody>";
								xml += xmldet;
							xml += "</tbody>";
							
						xml += "</table>";

					xml += "</body>";
			xml += '</pdf>';
			

    } catch (ex) {
        nlapiLogExecution('ERROR', 'Error Generating PDF Layout', 'ERROR: ' + ex);
        
    }

    return xml;

}


///////////////////////////////////////////FUNCTIONS LIBRARIES///////////////////////////////////////////////
function catchNull(val){
	val = val == null? '' : val;
	return val;	
}

//function preFormat(str){
//    return str.replace(/\n/g, "<br/>");
//}

function preFormat(str){
    str = nlapiEscapeXML(str);
    str = str.replace(/<br\/>/g, /\n/);
    return str.replace(/\n/g, "<br/>");
}

function toCurrency(amount) {
    var value = amount * 1.0;
    value = value.toFixed(2);
    if (!value) {
        value = "0.00"; 
    }
    
    value += '';
    
    return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    //return value; // no replace ","
}

function catchNull(val){
	val = val == null? '' : val;
	return val;	
}

function catchIsNaN(Amt){
	return isNaN(parseFloat(Amt))? 0 : parseFloat(Amt);
}

//For LOGO
function getSysURL() {
	// Dynamic URL
	var runningScriptId = nlapiGetContext().getScriptId();
	var runningScriptDeploymentId = nlapiGetContext().getDeploymentId();
	var searchScriptDeployment = nlapiSearchRecord('scriptdeployment',null,['scriptid','is',runningScriptDeploymentId],[new nlobjSearchColumn('internalid')]);
	var scriptDeploymentRec = nlapiLoadRecord('scriptdeployment',searchScriptDeployment[0].getId());
	var url = scriptDeploymentRec.getFieldValue('externalurl');
		url = url.substring(0,url.indexOf('/app')).replace('extforms','app');
	return url;
}
//End For LOGO

function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function get_Address(entityid){
	var address = '';
	var entitySearch = nlapiSearchRecord("entity",null,
	[
	  ["internalidnumber","equalto",entityid]
	],
	[
	  new nlobjSearchColumn("address1"),
	  new nlobjSearchColumn("address2"),
	  new nlobjSearchColumn("city"),
	  new nlobjSearchColumn("state"),
	  new nlobjSearchColumn("country")
	]
	);
	if(entitySearch){
	//address = set_Address(entitySearch[0].getValue('address1'))+set_Address(entitySearch[0].getValue('address2'))+set_Address(entitySearch[0].getValue('city'))+set_Address(entitySearch[0].getValue('state'))+set_Address(entitySearch[0].getValue('country'));
	address = set_Address(entitySearch[0].getValue('address1'))+set_Address(entitySearch[0].getValue('address2'))+set_Address(entitySearch[0].getValue('city'))+set_Address(entitySearch[0].getValue('state'));
	}
	return address;
}

function set_Address(str){
	if(str== null || str == 'null')
	return str = '';
	else
	return str = nlapiEscapeXML(str+' ');
}

//Get Image Section
function switchImg(companyid) {
	var imageID;
	switch (companyid) {   
		case 1: 					// Company A
	    	imageID = '1188'; 
	    	break;
		case 2: 					// Company B
	    	imageID = '1188'; 
	    	break;
		case 3: 					// AMA CORPO HO
	    	imageID = '1188'; 
	    	break;
		case 4: 					// AMA UNIVERSITY
	    	imageID = '1861'; 
	    	break;
		case 5: 					// AMAOED
	    	imageID = '1863'; 
	    	break;
		case 6: 					// AMACC MAKATI
	    	imageID = '1862'; 
	    	break;
	    default:
	    	imageID = '1188'; 		//DEFAULT
    	break;
	}	
	return imageID;
}
//End Get

