/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/search','N/log','N/runtime','N/currentRecord'],

    function(record,search,log,runtime,currRec) {
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
            try{
                var  currentRecord = scriptContext.currentRecord;
                var rec 		= currRec.get();
                var b_account 	= rec.getValue('account')
    
                var  sublistId = scriptContext.sublistId;
                var  fieldId = scriptContext.fieldId;
                if(!sublistId && (fieldId == 'account' || fieldId == 'custbody15') && currentRecord.id == ''){
                    //Validate Non-GCash Account only
                    if(b_account != 1){
                        var validationresult_Obj = validatecheckseriesRecord(currentRecord);
                        var validationresult = validationresult_Obj.return_value;
                        console.log("validationresult", validationresult);
                        if(validationresult == false){
                            alert('No Check Series Assignment for your Employee record.');
                            currentRecord.setValue('tranid','');
                        }
                        else{
                            var validationresultSearch = validationresult_Obj.checkseriesDetails_results;
                            var nextcheckseries = validationresultSearch[0].getValue('custrecord_itg_csppm_nextcheckseries');
                            var maximumseries = validationresultSearch[0].getValue('custrecord_itg_csppm_maximumseries');
                            var nextcheckseries2 = parseInt(nextcheckseries) + 1;
    
                            if(nextcheckseries2 > maximumseries){
                                alert('You have reached the Maximum Assigned Check Series: '+maximumseries+'.\nPlease Contact your Administrator to Update the Check Series Setup.');
                                currentRecord.setValue('tranid','');
                            }
                            else{
                                nextcheckseries = parseInt(nextcheckseries) + 1;
                                currentRecord.setValue('tranid',nextcheckseries);
                            }
                        }
                    }
                    
                }
            }
            catch(e){
                log.debug('ERROR ON fieldChanged', e.name+' : '+e.message);
            }
        }
        function validatecheckseriesRecord(currentRecord){
            var return_value = true;
            var exec_context = runtime.executionContext;
            var getCurrentUser = runtime.getCurrentUser();
            var user = getCurrentUser.id;
            var account = currentRecord.getValue('account');
            var paymentmethod = currentRecord.getValue('custbody15');
            
            if(user && account && paymentmethod){
                //Check Only if Non-GCash Accounts
                if(account != 1){
                    console.log("account", account + " user : " + user + " payment method:" + paymentmethod );
                    var checkseriesDetails_results = searchcheckseriesDetails(account,paymentmethod,user);
                    if(checkseriesDetails_results.length<1){
                        return_value = false;
                    }
                }
                
            }
            return {return_value:return_value,checkseriesDetails_results:checkseriesDetails_results};
        }

        function searchcheckseriesDetails(account,paymentmethod,user){
            var cs_search = searchRecords('customrecord_itg_checkseriesperpaymethod',
                [
                    ["custrecord_itg_csppm_accountlink","anyof",account],
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
                    search.createColumn({name: "custrecord_itg_csppm_minimumseries",label: "Minimum Series"}),
                    search.createColumn({name: "custrecord_itg_csppm_maximumseries",label: "Maximum Series"}),
                ]
            );
            console.log("Search Result", cs_search);
            return cs_search;
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
            var validationresult = ''; 
            try{
                var currentRecord = scriptContext.currentRecord;
                var validationresult_Obj = validatecheckseriesRecord(currentRecord);
                validationresult = validationresult_Obj.return_value;

                log.debug('Validation Result', validationresult);
    
                var rec 		= currRec.get();
                var b_account 	= rec.getValue('account')
              
                log.debug('Bank Account:', b_account);
                
                //Validate Non-GCash Account only
                if(b_account != 1){
                    if(currentRecord.id == ''){
                        if(validationresult == false){
                            alert('No Check Series Assignment for Your Employee Record.');
                        }
                        else{
                            var validationresultSearch = validationresult_Obj.checkseriesDetails_results;
                            var nextcheckseries = validationresultSearch[0].getValue('custrecord_itg_csppm_nextcheckseries');
                            var maximumseries = validationresultSearch[0].getValue('custrecord_itg_csppm_maximumseries');
                            var nextcheckseries2 = parseInt(nextcheckseries) + 1;
    
                            if(nextcheckseries2 > maximumseries){
                                validationresult = false;
                                alert('You have reached the Maximum Assigned Check Series: '+maximumseries+'.\nPlease Contact your Administrator to Update the Check Series Setup.');
                            }
                        }
                    }
                    else{
                        validationresult = true;
                    }
                }else{
                    validationresult = true;
                }
                
            }
            catch(e){
                log.debug('ERROR ON fieldChanged', e.name+' : '+e.message);
            }
            return validationresult;
        }
        /**
         * Create Search Records.
         * @class
         * @param {string} type - The record type of the records.
         * @param {array} filters - The array of filters for the search.
         * @param {array} column - The array of column for the search
         * @param {string} title - The title of the search
         * @param {string} id - the saved search id
         */
        function searchRecords(type, filters, columns, title, id){
            try{
                var mySearch = search.create({type:type,columns:columns,filters:filters,title:title,id:id});
                var arrSearchResults = [],
                init = true,
                count = 1000,
                min = 0,
                max = 1000,
                resultSet;
                while (count == 1000 || init){
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
        };
        return {
            fieldChanged: fieldChanged,
            saveRecord: saveRecord
        };
        
    });
    