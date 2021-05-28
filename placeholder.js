"use strict"

define(function (require) {

    const placeholderManager = require("core/placeholderManager");
    const ngComponent = require("core/ngComponent");
    
    const pickingService = require('services/ordersservice');
    
    var ordersData = [];
    var itemData = [];
    
    var placeHolder = function ($scope, $element, controlService) {

        //const _this = this;
        this.getItems = () => {
            var items = [{
                text: "Print Invoices",  // Button name
                key: "placeholderPrintInvoiceTemplate",  // Button id (unique)
                icon: "fa fa-print",  // Button icon
                content: {
                    moduleName: "placeholderPrintInvoiceTemplate",
                    controlName: "placeholderPrintInvoiceTemplate"
                }
            }];

            return items;
        };

        this.isEnabled = (itemKey) => {
            return true;
        };

        this.onClick = () => {
            var orders = $scope.viewStats.get_selected_orders();
 
            if (orders.length < 1) {
                alert('Please select at least one order');
                return;
            }
            
            /*if (orders.length > 30) {
                alert('You can generate labels for 30 orders maximum');
                return;
            }*/
            
            $scope.getOrderDataBySomeID();
        };
        
         ///======
        // Try to get data by macros with type API
        $scope.getOrderDataBySomeID = function(){  
                const self = this;
                
                const serviceOrder = new Services.OrdersService(self);
                const serviceInv = new Services.InventoryService(self);
                
                //var orders = $scope.viewStats.get_selected_orders();
            
                var orderObjects = $scope.viewStats.get_selected_orders_objects();
            
                var orderIDs = [];
               
                orderObjects.forEach(function(item) {
                    orderIDs.push(orderObjects[0].OrderId);
                });
                
                //===============
                // GET Orders data (order Notes, etc....) 
                serviceOrder.GetOrdersById(orderIDs, function (result) {
                    if(result.error == null) 
                    {
                        var orders = result.result;
                        
                        ordersData.push(orders[0]);
                        
                        alert('Something there! Notes: ' + orders.length);
                        
                        //================
                        // GET StockItems data (suppliers, images, etc....) 
                        var itemID = orderObjects[0].Items[0].ItemId;
                        
                        serviceInv.getInventoryItemById(itemID, function (result) {
                            
                            if(result.error == null) 
                            {
                                itemData.push(result);
                                //alert('Something there! ' + result.length + ' items.');
                            
                                serviceInv.GetInventoryItemImages(itemID, function (resultImg) {
                                    var t = resultImg;
                                });
                            } 
                            else 
                            {
                                alert('Errors!');
                            }
                        });
                    } 
                    else 
                    {
                        alert('Errors!');
                    }
                 });
                
                /*$.ajax({
                    type: 'POST',
                    url: $scope.$root.session.server + '/api/Macro/Run?applicatioName=TEST_PrintInvoices&macroName=TEST_print_invoices',
                    data: arrIds,
                    headers: {
                        'Authorization': $scope.$root.session.token, 
                        'Content-Type': 'application/json; charset=utf-8', 
                        'Accept-Language': 'en-US, en'
                    }
                }).done(function(data) {
                    let url = 'https://www.google.com/';
                    var win = window.open(url, '_blank');
                    win.focus();
                }); */
            };
    };
   
    placeholderManager.register("OpenOrders_OrderControlButtons", placeHolder);

});
