"use strict"

define(function (require) {
    const placeholderManager = require("core/placeholderManager");
    const ngComponent = require("core/ngComponent");
    
    const pdfMake = require('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/pdfmake.js');
    const pdfFonts = require('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/vfs_fonts.js');
    
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
            
            //pdfMake.vfs = pdfFonts.pdfMake.vfs;
            
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
                
                const dash = new Services.DashboardsService(self);
             
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
                        
                        //alert('Something there! Notes: ' + orders.length);
                        
                        // GET Order Extended Properties
                        serviceOrder.getExtendedProperties(orderIDs[0], function(orderExtProps) {
                            var o = orderExtProps;
                        });
                        
                        
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
                                
                                // GET required extended props of items
                                var ext_props = ['patch_name', 'customs_name', 'country_of_original'];
                                serviceInv.GetInventoryItemExtendedProperties(itemID, ext_props, function(itemExtProps) {
                                    var t2 = itemExtProps;
                                });
                                
                                // GET required supplier of item
                                serviceInv.GetStockSupplierStat(itemID, function(suppliers) {
                                    //alert('Get suppliers');
                                    var suppl = suppliers;
                                });
                              
                                // === Creating PDF invoice
                              
                                
                                var docDefinition = {
                                  info: {
                                    title:
                                      "Invoice",
                                    author: "",
                                    subject: "Invoice",
                                    keywords: "Invoice",
                                  },
                                  header: [
                                    {
                                      toc: {
                                        title: 
                                          { 
                                            text: 'Hello driver', 
                                            style: 'header' 
                                          }
                                      }
                                    },
                                    {
                                        table: 
                                        {
                                            headerRows: 1,
                                            heights: [220, 220],
                                            body: [
                                             [ 
                                                 "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
                                                , "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunk"
                                             ]
                                            ]
                                        }
                                    }
                                  ],
                                  content: [
                                    /*{
                                      text: 'This is a header',
                                      style: 'header',
                                      tocItem: true
                                    },*/
                                    {
                                      layout: 'lightHorizontalLines', // optional
                                      table: {
                                        // headers are automatically repeated if the table spans over multiple pages
                                        // you can declare how many rows should be treated as headers
                                        headerRows: 1,
                                        widths: [ '*', 'auto', 100, '*' ],

                                        body: [
                                          [ 'First', 'Second', 'Third', 'The last one' ],
                                          [ 'Value 1', 'Value 2', 'Value 3', 'Value 4' ],
                                          [ { text: 'Bold value', bold: true }, 'Val 2', 'Val 3', 'Val 4' ]
                                        ]
                                      }
                                    }
                                  ]
                                };
                                
                                pdfMake.createPdf(docDefinition).open();
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
            };
    };
   
    placeholderManager.register("OpenOrders_OrderControlButtons", placeHolder);

});
