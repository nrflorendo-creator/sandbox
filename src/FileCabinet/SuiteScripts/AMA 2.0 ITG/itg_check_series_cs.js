/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search','N/log'],
function(search,log){


    
  /**
   * Function to be executed after page is initialized.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
   *
   * @since 2015.2
   */
    function pageInit(scriptContext) {
    		
    }

  /**
   * Function to be executed when field is changed.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   * @param {string} scriptContext.fieldId - Field name
   * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
   * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
   *
   * @since 2015.2
   */
    function fieldChanged(scriptContext) {

    }

  /**
   * Function to be executed when field is slaved.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   * @param {string} scriptContext.fieldId - Field name
   *
   * @since 2015.2
   */
    function postSourcing(scriptContext) {

    }

  /**
   * Function to be executed after sublist is inserted, removed, or edited.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @since 2015.2
   */
    function sublistChanged(scriptContext) {

    }

  /**
   * Function to be executed after line is selected.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @since 2015.2
   */
    function lineInit(scriptContext) {

    }

  /**
   * Validation function to be executed when field is changed.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   * @param {string} scriptContext.fieldId - Field name
   * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
   * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
   *
   * @returns {boolean} Return true if field is valid
   *
   * @since 2015.2
   */
    function validateField(scriptContext) {

    }

  /**
   * Validation function to be executed when sublist line is committed.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @returns {boolean} Return true if sublist line is valid
   *
   * @since 2015.2
   */
    function validateLine(scriptContext) {

    }

  /**
   * Validation function to be executed when sublist line is inserted.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @returns {boolean} Return true if sublist line is valid
   *
   * @since 2015.2
   */
    function validateInsert(scriptContext) {

    }

  /**
   * Validation function to be executed when record is deleted.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   *
   * @returns {boolean} Return true if sublist line is valid
   *
   * @since 2015.2
   */
    function validateDelete(scriptContext) {

    }

  /**
   * Validation function to be executed when record is saved.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @returns {boolean} Return true if record is valid
   *
   * @since 2015.2
   */
    function saveRecord(scriptContext) {
    	
    	var rec = scriptContext.currentRecord;
        var rectype = rec.type;
        var return_save = true;
        var recid = rec.id;
        
        try{
        	var BankAccount 	= rec.getValue({fieldId:'custrecord_itg_csppm_accountlink'});
            var PaymentMethod 	= rec.getValue({fieldId:'custrecord_itg_csppm_paymentmethod'});
            var User 			= rec.getValue({fieldId:'custrecord_itg_csppm_user'});

//            log.debug('PaymentMethod',PaymentMethod);
//            log.debug('User',User);
            if(recid == ''){
            	recid = 0;

            	log.debug('id',recid);
            
            }
            if(rectype == 'customrecord_itg_checkseriesperpaymethod'){
            	var searchSeriesRecord = searchRecords(
        		   "customrecord_itg_checkseriesperpaymethod",
        		   [
        		      ["custrecord_itg_csppm_accountlink","anyof",BankAccount], 
        		      "AND", 
        		      ["custrecord_itg_csppm_paymentmethod","anyof",PaymentMethod], 
        		      "AND", 
        		      ["custrecord_itg_csppm_user","anyof",User],
        		      "AND",
        		      ["internalid","noneof",recid],
        		      "AND",
        		      ["isinactive","is","F"]
        		   ],
        		   [
        		      search.createColumn({
        		         name: "custrecord_itg_csppm_accountlink",
        		         sort: search.Sort.ASC,
        		         label: "Bank Account"
        		      }),
        		      search.createColumn({name: "custrecord_itg_csppm_paymentmethod", label: "Payment Method"}),
        		      search.createColumn({name: "custrecord_itg_csppm_nextcheckseries", label: "Check Series"}),
        		      search.createColumn({name: "custrecord_itg_csppm_user", label: "User"})
        		   ]
        		);
            	
            	
        		if(searchSeriesRecord){
        			if(searchSeriesRecord.length > 0){
        				log.debug('searchSeriesRecord',searchSeriesRecord);

            			alert('This data {Bank, Payment Method and User} has a duplicate record.');
            			return_save = false;
                	}
        			
        		}
        		
            }
        	
        }catch(e){
        	log.debug(e.name,e.message);
        }

        return return_save;
        
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
  return {
//        pageInit: pageInit,
//        fieldChanged: fieldChanged,
//        postSourcing: postSourcing,
//        sublistChanged: sublistChanged,
//        lineInit: lineInit,
//        validateField: validateField,
//        validateLine: validateLine,
//        validateInsert: validateInsert,
//        validateDelete: validateDelete,
        saveRecord: saveRecord
  };
    
});
