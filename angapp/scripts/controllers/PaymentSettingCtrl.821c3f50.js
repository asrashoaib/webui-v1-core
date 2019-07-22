app.controller("PaymentSettingCtrl",["$translate","$window","$location","$translatePartialLoader","$timeout","$scope","$q","$rootScope","UserService","Restangular","StripeService",function($translate,$window,$location,$translatePartialLoader,$timeout,$scope,$q,$rootScope,UserService,Restangular,StripeService){$scope.clearMessage=function(){$rootScope.floatingMessage=[]};$scope.openModal=function(modalId){$(".modal#"+modalId).modal("show"),"setting-add-card"==modalId&&$(".modal#"+modalId).modal("setting",{onApprove:$scope.saveCard}),"setting-propagate-card"==modalId&&$(".modal#"+modalId).modal("setting",{onApprove:$scope.cardPropagate})};var hashVal=$location.hash();hashVal&&($("#payment-tabs").find("[data-tab]").removeClass("active"),$("#payment-tabs").find("[data-tab="+hashVal+"]").addClass("active")),$scope.clickHash=function(tabName){$location.hash(tabName).replace()},$("#payment-tabs .menu-tabs .item").tab({context:$("#payment-tabs")}),$scope.showStripe=!1,StripeService.getAccount().then(function(success){success[0]?$scope.showStripe=!0:($("#ccard").addClass("active"),$scope.showStripe=!1)}),$scope.$emit("loading_finished")}]),app.controller("TabStripeCtrl",["$translate","$window","$location","$timeout","$scope","$q","$rootScope","UserService","Restangular","StripeService",function($translate,$window,$location,$timeout,$scope,$q,$rootScope,UserService,Restangular,StripeService){function getStripeAccountLinked(stripeId){return Restangular.one("account/stripe/linked").customGET(stripeId).then(function(success){var linkedObj=success.plain();return"t"==linkedObj.linked})["catch"](function(error){return console.error("account/stripe/linked error",error),!1})}$scope.checkall=function($evt){var $elem=$evt.currentTarget,elem=angular.element($elem),input=elem.children("input:checkbox").prop("checked");input?$(".stripe-connect-table tbody .t-check-box").find(".ui.checkbox").checkbox("uncheck"):$(".stripe-connect-table tbody .t-check-box").find(".ui.checkbox").checkbox("check")},StripeService.getAccount().then(function(success){$scope.$emit("loading_finished"),$scope.stripeAccounts=success,$rootScope.checkSaccount=$scope.stripeAccounts}),StripeService.clientID().then(function(success){$scope.clientID=success,$scope.stripeConnect=function(){if($scope.clientID.client_id&&$scope.clientID.publishable_key&&$scope.clientID.secret_key){var client_id=$scope.clientID.client_id,redirect=StripeService.redirectURL(),state=StripeService.generateStateParam("/payment-setting");$window.location.href="https://connect.stripe.com/oauth/authorize?response_type=code&client_id="+client_id+"&scope=read_write&redirect_uri="+redirect+"&state="+state}else setTimeout(function(){$translate(["stripe_not_setup"]).then(function(value){$scope.notsetup=value.stripe_not_setup,msg={header:$scope.notsetup},$rootScope.floatingMessage=msg,$scope.hideFloatingMessage()})},50)}}),$scope.deleteConfirm=function(){$scope.lst=[],$(".stripe-connect-row").each(function(){$(this).find(".t-check-box input").prop("checked")&&$scope.lst.push($(this).scope().account)}),0==$scope.lst.length?(msg={header:"tab_stripeconnect_select_error"},$rootScope.floatingMessage=msg,$scope.hideFloatingMessage()):$(".modal#connection-delete-confirm").modal("show")},$scope.deleteMultiAccount=function(){for(var i=0;i<$scope.lst.length;i++)$scope.removeStripe($scope.lst[i])},$scope.removeStripe=function(account){getStripeAccountLinked(account.id).then(function(result){result?$translate("tab_stripeconnect_select_error_linked").then(function(result){var msg={header:result};$rootScope.floatingMessage=msg,$scope.hideFloatingMessage()}):StripeService.removeStripeConnect(account).then(function(success){msg={header:"success_message_save_changes_button"},$rootScope.floatingMessage=msg,$scope.hideFloatingMessage(),$scope.stripeAccounts.splice($scope.stripeAccounts.indexOf(account),1)},function(fail){msg={header:fail.data.message},$rootScope.floatingMessage=msg,$scope.hideFloatingMessage()})})}}]),app.controller("TabCardCtrl",["$translate","$rootScope","$window","$location","$timeout","$scope","$q","UserService","Restangular","StripeService","PortalSettingsService",function($translate,$rootScope,$window,$location,$timeout,$scope,$q,UserService,Restangular,StripeService,PortalSettingsService){function getStripeExtraDetails(){Restangular.one("account").one("address").get().then(function(address){var city,country,street;angular.forEach(address.personal,function(value,key,obj){return value.primary_address?(city=value.city,country=value.country,void(street=value.street1)):(city=value.city,country=value.country,void(street=value.street1))}),$scope.stripeExtraDetails.address_city=city,$scope.stripeExtraDetails.address_country=country,$scope.stripeExtraDetails.address_line1=street,$scope.stripeExtraDetails.name=$scope.user.first_name+" "+$scope.user.last_name})}function setBrandIcon(brand,cardBrandToPfClass){var brandIconElement=document.getElementById("brand-icon"),pfClass="pf-credit-card";if(brand in cardBrandToPfClass)switch(pfClass=cardBrandToPfClass[brand],brand){case"visa":$("#brand-icon").css("background-image","url(images/cards/Visa.png)");break;case"mastercard":$("#brand-icon").css("background-image","url(images/cards/MasterCard.png)");break;case"amex":$("#brand-icon").css("background-image","url(images/cards/American%20Express.png)");break;case"dinersclub":$("#brand-icon").css("background-image","url(images/cards/diners.png)");break;case"discover":$("#brand-icon").css("background-image","url(images/cards/Discover.png)");break;case"jcb":$("#brand-icon").css("background-image","url(images/cards/jcb.png)");break;default:$("#brand-icon").css("background-image","url(images/cards/default-credit-card-icon.png)")}for(var i=brandIconElement.classList.length-1;i>=0;i--)brandIconElement.classList.remove(brandIconElement.classList[i]);brandIconElement.classList.add("pf"),brandIconElement.classList.add(pfClass)}function getStripeMode(){StripeService.clientID().then(function(success){if("publishable_key"in success){var indexOf=success.publishable_key.indexOf("test");indexOf>-1?$scope.testMode=!0:$scope.testMode=!1}})}function getPledgerAccount(){StripeService.getPledgerAccount().then(function(success){$scope.account=success.plain(),getStripeMode(),success.length?(hasAccount=!0,$scope.hascard=!0):(hasAccount=!1,$scope.hascard=!1)})}$scope.user=UserService;$scope.stripeExtraDetails={address_city:"",address_country:"",address_line1:"",name:""},$scope.testMode=!1,$scope.editCard={},$scope.pcard="dw";var portal_settings;PortalSettingsService.getSettingsObj().then(function(success){$scope.$emit("loading_finished"),portal_settings=success.public_setting,$scope.site_stripe_tokenization_settings=success.public_setting.site_stripe_tokenization,"undefined"==typeof $scope.site_stripe_tokenization_settings||null==$scope.site_stripe_tokenization_settings?$scope.site_stripe_tokenization_settings={toggle:!1,public_stripe_key:""}:getStripeExtraDetails()}),$scope.openModal=function(modalId){$(".modal#"+modalId).modal("setting",{onApprove:$scope.saveCard}).modal("show"),"setting-propagate-card"==modalId&&$(".modal#"+modalId).modal("setting",{onApprove:$scope.cardPropagate})},$scope.checkall=function($evt){var $elem=$evt.currentTarget,elem=angular.element($elem),input=elem.children("input:checkbox").prop("checked");input?$(".card-table tbody .t-check-box").find(".ui.checkbox").checkbox("uncheck"):$(".card-table tbody .t-check-box").find(".ui.checkbox").checkbox("check")};var hasAccount=!1;getPledgerAccount();var currentDate=new Date;$scope.currentMonth=currentDate.getMonth()+1,$scope.currentYear=currentDate.getFullYear(),$scope.selectCard=function(card){$("#credit-card-info").form("clear"),$scope.cardSelected=card},$scope.newCard=function(){$("#credit-card-info").form("clear"),$scope.cardSelected={card_token:"",stripe_account_id:"",number:"",exp_month:"",exp_year:"",cvc:"",name:""},hasAccount&&($scope.cardSelected.stripe_account_id=$scope.account[0].stripe_account_id)},$scope.propagateCard=function(card){$("#credit-card-info").form("clear"),$scope.pcard=card},$scope.cardPropagate=function(){msg={loading:!0,loading_message:"in_progress"},$rootScope.floatingMessage=msg,Restangular.one("campaign/account-card",$scope.pcard.stripe_account_card_id).customPUT().then(function(success){msg={header:"tab_managecard_default_card"},$rootScope.floatingMessage=msg,$scope.hideFloatingMessage(),getPledgerAccount()})},$scope.openEditModal=function(modalId){$(".modal#"+modalId).modal("setting",{onApprove:$scope.submitEditCard}).modal("show")},$scope.submitEditCard=function(){var editCardData={};for(var i in $scope.editCard)"display_number"!=i&&(editCardData[i]=$scope.editCard[i]);update=StripeService.updateCard($scope.editCard.stripe_account_id,$scope.editCard.stripe_account_card_id,editCardData),update.then(function(success){msg={header:"success_message_save_changes_button"},$rootScope.floatingMessage=msg,$scope.hideFloatingMessage(),getPledgerAccount()},function(failed){"invalid_request_error"==failed.data.type?msg={header:failed.data.type}:msg={header:failed.data.code},$rootScope.floatingMessage=msg,$scope.hideFloatingMessage()})},$scope.setEditCard=function(card){for(var i in card)$scope.editCard[i]=card[i];$scope.editCard.display_number="**** **** **** "+card.last4},$scope.initStripeElement=function(){var translation=$translate.instant(["pledge_campaign_stripe_elements_cardExpirey","pledge_campaign_stripe_elements_cardNumber","pledge_campaign_creditcard_cvc_placeholder"]);$scope.stripe=Stripe($scope.site_stripe_tokenization_settings.public_stripe_key),$scope.elements=$scope.stripe.elements();var cardBrandToPfClass={visa:"pf-visa",mastercard:"pf-mastercard",amex:"pf-american-express",discover:"pf-discover",diners:"pf-diners",jcb:"pf-jcb",unknown:"pf-credit-card"},style={base:{iconColor:"#A3A3A3",color:"#000000",lineHeight:"16px",fontWeight:400,fontFamily:'Lato,"Helvetica Neue0",Arial,Helvetica,sans-serif',fontSize:"14px","::placeholder":{color:"#A3A3A3"}},invalid:{color:"#d95c5c",":focus":{color:"#d95c5c"}}};$scope.cardNumberElement=$scope.elements.create("cardNumber",{placeholder:translation.pledge_campaign_stripe_elements_cardNumber,iconStyle:"solid",style:style}),$scope.cardNumberElement.mount("#card-number-element"),$scope.cardExpiryElement=$scope.elements.create("cardExpiry",{placeholder:translation.pledge_campaign_stripe_elements_cardExpirey,iconStyle:"solid",style:style}),$scope.cardExpiryElement.mount("#card-expiry-element"),$scope.cardCvcElement=$scope.elements.create("cardCvc",{placeholder:translation.pledge_campaign_creditcard_cvc_placeholder,iconStyle:"solid",style:style}),$scope.cardCvcElement.mount("#card-cvc-element"),$scope.cardNumberElement.addEventListener("change",function(event){var displayError=angular.element("#card-errors");event.error?displayError.textContent=event.error.message:displayError.textContent="",event.brand&&setBrandIcon(event.brand,cardBrandToPfClass)}),$("#brand-icon").css("background-image","url(images/cards/default-credit-card-icon.png)")},$scope.saveCard=function(){var promises=[],not_validated=!$("#credit-card-info").form("validate form");return!not_validated&&(msg={loading:!0,loading_message:"in_progress"},$rootScope.floatingMessage=msg,hasAccount?$scope.cardSelected.stripe_account_card_id?promises.push(StripeService.updateCard($scope.cardSelected.stripe_account_id,$scope.cardSelected.stripe_account_card_id,$scope.cardSelected)):$scope.site_stripe_tokenization_settings.toggle?($scope.stripeExtraDetails.name=$scope.cardSelected.name,$scope.stripe.createToken($scope.cardNumberElement,$scope.stripeExtraDetails).then(function(result){result.error?$timeout(function(){$rootScope.removeFloatingMessage();angular.element(document.querySelector("#card-errors")).html(result.error.message);msg={header:"pledge_campaign_stripe_elements_error"},$rootScope.floatingMessage=msg,$("#finalpledge").removeClass("disabled")},0):($scope.cardSelected.card_token=result.token.id,promises.push(StripeService.createCard($scope.cardSelected.stripe_account_id,$scope.cardSelected)))})):promises.push(StripeService.createCard($scope.cardSelected.stripe_account_id,$scope.cardSelected)):$scope.site_stripe_tokenization_settings.toggle?($scope.stripeExtraDetails.name=$scope.cardSelected.name,$scope.stripe.createToken($scope.cardNumberElement,$scope.stripeExtraDetails).then(function(result){result.error?$timeout(function(){$rootScope.removeFloatingMessage();angular.element(document.querySelector("#card-errors")).html(result.error.message);msg={header:"pledge_campaign_stripe_elements_error"},$rootScope.floatingMessage=msg,$("#finalpledge").removeClass("disabled")},0):($scope.cardSelected.card_token=result.token.id,promises.push(StripeService.newPledgerAccount($scope.cardSelected)))})):promises.push(StripeService.newPledgerAccount($scope.cardSelected)),void $scope.resolvePromiseChain(promises))},$scope.resolvePromiseChain=function(promises){$q.all(promises).then(function(success){msg={header:"success_message_save_changes_button"},$rootScope.floatingMessage=msg,$scope.hideFloatingMessage(),$scope.site_stripe_tokenization_settings.toggle&&($scope.cardNumberElement.clear(),$scope.cardExpiryElement.clear(),$scope.cardCvcElement.clear()),$timeout(function(){getPledgerAccount()},3e3)},function(failed){"invalid_request_error"==failed.data.type?msg={header:failed.data.type}:msg={header:failed.data.code},$rootScope.floatingMessage=msg,$scope.hideFloatingMessage()})},$scope.removeCard=function(card){return StripeService.deleteCard($scope.account[0].stripe_account_id,card.stripe_account_card_id)},$scope.deleteMultiCard=function(){msg={loading:!0,loading_message:"in_progress"},$rootScope.floatingMessage=msg;var lst=[],requestQueue=[];if($(".card-row").each(function(){$(this).find(".t-check-box input").prop("checked")&&lst.push($(this).scope().card)}),0==lst.length)msg={header:"checkbox_select_error"},$rootScope.floatingMessage=msg,$scope.hideFloatingMessage();else{for(var i=0;i<lst.length;i++)requestQueue.push($scope.removeCard(lst[i]));$q.all(requestQueue).then(function(success){angular.forEach(success,function(value){angular.forEach($scope.account[0].cards,function(card,index){value.id==card.id&&$scope.account[0].cards.splice(index,1)})}),getPledgerAccount(),msg={header:"deleted_success"},$rootScope.floatingMessage=msg,$scope.hideFloatingMessage()},function(failed){msg={header:failed.data.code},$rootScope.floatingMessage=msg,$scope.hideFloatingMessage()})}},$scope.eraseAccount=function(){$("#erase-account-confirm").modal("setting",{onApprove:function(){msg={loading:!0,loading_message:"in_progress"},$rootScope.floatingMessage=msg,Restangular.one("account/stripe/"+$scope.account[0].id).customDELETE().then(function(){msg={header:"deleted_success"},$rootScope.floatingMessage=msg,$scope.hideFloatingMessage(),getPledgerAccount()},function(failed){msg={header:failed.data.code},$rootScope.floatingMessage=msg,$scope.hideFloatingMessage()})}}).modal("show")}}]);