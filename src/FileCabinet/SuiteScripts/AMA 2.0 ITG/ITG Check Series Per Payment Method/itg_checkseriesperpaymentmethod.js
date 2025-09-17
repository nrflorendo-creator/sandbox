/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/log','N/record','N/runtime','N/ui/serverWidget','N/redirect','N/search','N/url','N/format'],
function(log,record,runtime,serverWidget,redirect,search,url,format) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
    	try{
	    	var newRecord = scriptContext.newRecord;
	    	var subsidiary = newRecord.getValue('subsidiary');
	    	var form = scriptContext.form;
			var type = scriptContext.type;
			var exec_context = runtime.executionContext;
			var getCurrentUser = runtime.getCurrentUser();
			var current_Role = getCurrentUser.role;
			//form.clientScriptFileId = 6526;//PROD
			form.clientScriptModulePath = "SuiteScripts/AMA 2.0 ITG/ITG Check Series Per Payment Method/itg_checkseriesperpaymentmethod_billpayment_cs.js";
	    	if((type == 'create' || type == 'edit' || type == 'view') && exec_context == 'USERINTERFACE'){
	    		log.debug('type',type);
				log.debug('exec_context',exec_context);
	    		var checkseriesSubList = displayCheckSeriesTab(form,type);
	    		displaycheckseriesdetailsData(newRecord.id,checkseriesSubList);
	    	}
    	}
    	catch(e){
    		log.debug('ERROR ON beforeLoad', e.name+' : '+e.message);
    	}
    }
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {

    }
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
    	try{
	    	var newRecord = scriptContext.newRecord;
	    	var subsidiary = newRecord.getValue('subsidiary');
	    	var form = scriptContext.form;
			var type = scriptContext.type;
			var exec_context = runtime.executionContext;
			var getCurrentUser = runtime.getCurrentUser();
			var current_Role = getCurrentUser.role;

			
			if(newRecord.type == 'account'){
				// if((type == 'create' || type == 'edit') && exec_context == 'USERINTERFACE'){
				if((type == 'create') && exec_context == 'USERINTERFACE'){
					var checkseries_len = newRecord.getLineCount('custpage_checkseries_sublist');
					// log.debug('checkseries_len',checkseries_len);
					if(checkseries_len>0){
						for(var x=0; x<checkseries_len;x++){
							var cs_id = newRecord.getSublistValue('custpage_checkseries_sublist','custpage_cs_id',x);
							var account_id = newRecord.id;
							var paymentmethod = newRecord.getSublistValue('custpage_checkseries_sublist','custpage_cs_paymentmethod',x);
							var nextcheckseries = newRecord.getSublistValue('custpage_checkseries_sublist','custpage_cs_nextcheckseries',x);
							var checkseriesuser = newRecord.getSublistValue('custpage_checkseries_sublist','custpage_cs_checkseriesuser',x);
							var objRecord = '';
							if(cs_id){
								objRecord = record.load({type:'customrecord_itg_checkseriesperpaymethod',id:cs_id,isDynamic:true});
							}
							else{
								objRecord = record.create({type:'customrecord_itg_checkseriesperpaymethod',isDynamic:true});
							}
							objRecord.setValue('custrecord_itg_csppm_accountlink',account_id);
							objRecord.setValue('custrecord_itg_csppm_paymentmethod',paymentmethod);
							objRecord.setValue('custrecord_itg_csppm_nextcheckseries',nextcheckseries);
							objRecord.setValue('custrecord_itg_csppm_user',checkseriesuser);

							var newRecord_id = objRecord.save({enableSourcing:true,ignoreMandatoryFields:true});
						}
					}
				}
			}else if(newRecord.type == 'vendorpayment'){

				// if((type == 'create' || type == 'edit') && exec_context == 'USERINTERFACE'){
				if((type == 'create') && exec_context == 'USERINTERFACE'){
					var account = newRecord.getValue('account');
					var paymentmethod = newRecord.getValue('custbody15');
					var user = getCurrentUser.id;
					
					// log.debug('account',account);
					// log.debug('paymentmethod',paymentmethod);
					// log.debug('user',user);
					// log.debug('user 2 test',getCurrentUser.id);

					//Searh Existing Check Series based on Account, Payment Method and User
					var existingseries = searchexistingcheckseries(account,paymentmethod,user);

					if(existingseries){
						if(existingseries.length>0){
							var currentcheckseries = parseFloat(existingseries[0].getValue({name : 'custrecord_itg_csppm_nextcheckseries'}));
							var nextcheckseries =  currentcheckseries + 1;

							record.submitFields({
								type: 'customrecord_itg_checkseriesperpaymethod',
							    id: existingseries[0].id,
							    values: {
							        'custrecord_itg_csppm_nextcheckseries': (nextcheckseries.toFixed(0)).toString(),
							    }
							});

//							record.submitFields({
//								type: 'vendorpayment',
//							    id: newRecord.id,
//							    values: {
//							        'tranid': (nextcheckseries.toFixed(0)).toString(),
//							    }
//							});

						}
					}
				}
			}	


			
    	}
    	catch(e){
    		log.debug('ERROR ON afterSubmit',e.name+' : '+e.message);
    	}
    }

    function searchRecords(type, filters, columns, title, id){
		try{
			var mySearch = search.create({type:type,columns:columns,filters:filters,title:title,id:id});
			var arrSearchResults = [],
			init = true,
			count = 1000,
			min = 0,
			max = 1000,
			resultSet;
			while (count == 1000 || init) {
				var rs = mySearch.run();	  		
				var resultRange = rs.getRange({start:min,end:max}); 			
				arrSearchResults = arrSearchResults.concat(resultRange);
				min = max;
				max += 1000;
				init = false;
				count = resultRange.length;
			}
			return arrSearchResults;
		}
		catch (ex){
			return null;
		} 
	}

    function searchcheckseriesDetails(cfrom_id){
    	var cs_search = searchRecords('customrecord_itg_checkseriesperpaymethod',
    			[
    				["custrecord_itg_csppm_accountlink","anyof",cfrom_id],
    			],
    			[
    			 	search.createColumn({name: "custrecord_itg_csppm_accountlink",label: "Account Link"}),
    				search.createColumn({name: "custrecord_itg_csppm_paymentmethod",label: "Payment Method"}),
    				search.createColumn({name: "custrecord_itg_csppm_nextcheckseries",label: "Courier Next Check Series"}),
    				search.createColumn({name: "custrecord_itg_csppm_user",label: "Check Series User"}),
    			]
        	);
    	return cs_search;
    }


    function searchexistingcheckseries(bank_id,paymentmethod,user){

    	// log.debug('user1',bank_id);
    	// log.debug('user2',paymentmethod);
    	// log.debug('user3',user);
    	
    	var cs_search = searchRecords('customrecord_itg_checkseriesperpaymethod',
    			[
    				["custrecord_itg_csppm_accountlink","anyof",bank_id],
    				"AND",
    				["custrecord_itg_csppm_paymentmethod","anyof",paymentmethod],
    				"AND",
    				["custrecord_itg_csppm_user","anyof",user],
    				"AND",
    				["isinactive","is","F"]
    			],
    			[
    			 	search.createColumn({name: "custrecord_itg_csppm_accountlink",label: "Account Link"}),
    				search.createColumn({name: "custrecord_itg_csppm_paymentmethod",label: "Payment Method"}),
    				search.createColumn({name: "custrecord_itg_csppm_nextcheckseries",label: "Courier Next Check Series"}),
    				search.createColumn({name: "custrecord_itg_csppm_user",label: "Check Series User"}),
    			]
        	);

    	return cs_search;
    }

    function displaycheckseriesdetailsData(cfrom_id,checkseriesSubList){
    	// log.debug('id',cfrom_id);
    	var cs_search = searchcheckseriesDetails(cfrom_id);
    	// log.debug('cs_search',cs_search);
    	// log.debug('cs_search.length',cs_search.length);
    	if(cs_search){

    		if(cs_search.length>0){
    			for(var x=0; x<cs_search.length;x++){
    				// var accountlink = cs_search[x].getValue({name: "custrecord_itg_csppm_accountlink"});
    				// if(accountlink != ''){
    				// 	checkseriesSubList.setSublistValue({
        //     			    id : 'custpage_cs_account',
        //     			    line : x,
        //     			    value : accountlink
        //     			});
    				// }
    				var paymentmethod = cs_search[x].getValue({name: "custrecord_itg_csppm_paymentmethod"});
    				if(paymentmethod != ''){
    					checkseriesSubList.setSublistValue({
            			    id : 'custpage_cs_paymentmethod',
            			    line : x,
            			    value : paymentmethod
            			});
    				}
    				var nextcheckseries = cs_search[x].getValue({name: "custrecord_itg_csppm_nextcheckseries"});
    				if(nextcheckseries != ''){
    					checkseriesSubList.setSublistValue({
            			    id : 'custpage_cs_nextcheckseries',
            			    line : x,
            			    value : nextcheckseries
            			});
    				}
    				var checkseriesuser = cs_search[x].getValue({name: "custrecord_itg_csppm_user"});
    				if(checkseriesuser != ''){
    					checkseriesSubList.setSublistValue({
            			    id : 'custpage_cs_checkseriesuser',
            			    line : x,
            			    value : checkseriesuser
            			});
    				}
    				checkseriesSubList.setSublistValue({
        			    id : 'custpage_cs_id',
        			    line : x,
        			    value : cs_search[x].id
        			});
    				
    			}
    		}
    	}
    	return cs_search;
    }
    /**
     * @param {form} NetSuite Custom Form - Object
     * @param {type} type of record instance
     */
    function displayCheckSeriesTab(form,type){
    	var shippingTab = form.addTab({
			id : 'custpage_checkseries_tab',
		    label : 'Check Series Per Payment Method'
		});
		var checkseriesSubList = form.addSublist({
			id : 'custpage_checkseries_sublist',
			type : serverWidget.SublistType.INLINEEDITOR,
			label : 'Check Series Per Payment Method',
			tab : 'custpage_checkseries_tab' 
		});
		var cs_id = checkseriesSubList.addField({
			id : 'custpage_cs_id',
		    type : serverWidget.FieldType.TEXT,
		    label : 'ID',
		});
		initiate_hide(cs_id);
		// var account = checkseriesSubList.addField({
		// 	id : 'custpage_cs_account',
		//     type : serverWidget.FieldType.SELECT,
		//     source : '-112',
		//     label : 'Account',
		// });
		// account.isMandatory = true;
		var paymentmethod = checkseriesSubList.addField({
			id : 'custpage_cs_paymentmethod',
		    type : serverWidget.FieldType.SELECT,
		    source : '-183',
		    label : 'Payment Method',
		});
		paymentmethod.isMandatory = true;
		var nextcheckseries = checkseriesSubList.addField({
			id : 'custpage_cs_nextcheckseries',
		    type : serverWidget.FieldType.TEXT,
		    label : 'Next Check Series',
		});
		nextcheckseries.isMandatory = true;

		var checkseriesuser = checkseriesSubList.addField({
			id : 'custpage_cs_checkseriesuser',
		    type : serverWidget.FieldType.SELECT,
		    source : '-4',
		    label : 'Check Series User',
		});
		// checkseriesuser.isMandatory = true;

		return checkseriesSubList;
    }
    /**
     * @param {form} NetSuite Custom Form - Object
     * @param {fields} Fields to be hidden
     */
    function disableFields(form,field_list){
    	try{
    		if(field_list.sublistId == 'main'){
        		if(field_list.fieldid.length > 0){
        			for(var x=0; x<field_list.fieldid.length; x++){
        				var field = form.getField({
        					id: field_list.fieldid[x]
        				});
        				if(field != null){
            				if(field.hasOwnProperty('id')){
            					initiate_disable(field);
            				}
        				}
        			}
        		}
        	}
    		else{
        		if(field_list.fieldid.length > 0){
        			var sublist = form.getSublist({
    					id:field_list.sublistId
    				});
    				if(sublist.hasOwnProperty('label')){
        				for(var x=0; x<field_list.fieldid.length; x++){
            				var field = sublist.getField({
            					id: field_list.fieldid[x]
            				});
            				if(!isEmpty(field)){
            					//DIFFERENT CONDITION OR CRITERIA FOR FIELD VALIDATION/EXISTENCE
            					if(field_list.fieldid[x] == 'costestimate' || field_list.fieldid[x] == 'costestimaterate' || field_list.fieldid[x] == 'estgrossprofit' || field_list.fieldid[x] == 'estgrossprofitpercent' || field_list.fieldid[x] == 'options'){
            						if(field.hasOwnProperty('id')){
            							initiate_disable(field);
            						}
            					}
            					else{
            						initiate_disable(field);
            					}
							}
            			}
        			}
        		}
        	}
    	}
    	catch(e){
    		log.debug('ERROR ON disableFields', e.name+' : '+e.message);
    	}
    }
    /**
     * @param {fields} Fields to be hidden
     */
    function initiate_disable(field){
    	try{
    		field.updateDisplayType({
				displayType : serverWidget.FieldDisplayType.DISABLED
			});
    	}
    	catch(e){
    		
    	}
    	return;
    }
    /**
     * 
     * Hiding the field
     * 
     */
    function initiate_hide(field){
    	try{
    		field.updateDisplayType({
				displayType : serverWidget.FieldDisplayType.HIDDEN
			});
    	}
    	catch(e){
    		log.debug('ERROR ON initiate_hide',e.name+' : '+e.message);
    	}
    	return;
    }
    /**
     * 
     * Trim string
     * 
     */
    function trimToBlank(aString) {
    	if(aString!=null) {
    		aString = aString+'';
    		var str = String(aString);
    		if(str!=null) {
    			return str.trim();
    		}
    	}
    	return '';
    }
    /**
     * 
     * Set Blank
     * 
     */
    function set_Blank(str){
    	if(str== null || str == 'null')
    		return str = '';
    	else
    		return str = str;
    }
    Object.prototype.isEmpty = function() {
        for(var key in this) {
            if(this.hasOwnProperty(key))
                return false;
        }
        return true;
    }
    /**
	 * Create Search Records.
	 * @class
	 * @param {object} s - Search Object

	 */
    function getAllResults(s) {
        var results = s.run();
        var searchResults = [];
        var searchid = 0;
        var resultslice = '';
        do{
            resultslice = results.getRange({start: searchid, end: searchid + 1000});
            resultslice.forEach(function (slice) {
            	searchResults.push(slice);
                searchid++;
            });
        }
        while(resultslice.length >= 1000);
        return searchResults;
    }
    return {
       beforeLoad: beforeLoad,
       beforeSubmit: beforeSubmit,
       afterSubmit: afterSubmit
    };
    
});
