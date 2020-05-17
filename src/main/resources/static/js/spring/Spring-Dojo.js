/*
 * Copyright 2004-2008 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
dojo.declare("Spring.DefaultEquals",null,{equals:function(_1){if(_1.declaredClass&&_1.declaredClass==this.declaredClass){return true;}else{return false;}}});dojo.declare("Spring.ElementDecoration",[Spring.AbstractElementDecoration,Spring.DefaultEquals],{constructor:function(_2){this.copyFields=new Array("name","value","type","checked","selected","readOnly","disabled","alt","maxLength","class","title");dojo.mixin(this,_2);if(this.widgetModule==""){this.widgetModule=this.widgetType;}},apply:function(){if(dijit.byId(this.elementId)){dijit.byId(this.elementId).destroyRecursive(false);}var _3=dojo.byId(this.elementId);if(!_3){console.error("Could not apply "+this.widgetType+" decoration.  Element with id '"+this.elementId+"' not found in the DOM.");}else{var _4=this.widgetAttrs["datePattern"];if(_4&&this.widgetType=="dijit.form.DateTextBox"){if(!this.widgetAttrs["value"]){this.widgetAttrs["value"]=dojo.date.locale.parse(_3.value,{selector:"date",datePattern:_4});}if(!this.widgetAttrs["serialize"]){this.widgetAttrs["serialize"]=function(d,_6){return dojo.date.locale.format(d,{selector:"date",datePattern:_4});};}}for(var _7 in this.copyFields){_7=this.copyFields[_7];if(!this.widgetAttrs[_7]&&_3[_7]&&(typeof _3[_7]!="number"||(typeof _3[_7]=="number"&&_3[_7]>=0))){this.widgetAttrs[_7]=_3[_7];}}if(_3["style"]&&_3["style"].cssText){this.widgetAttrs["style"]=_3["style"].cssText;}dojo.require(this.widgetModule);var _8=dojo.eval(this.widgetType);this.widget=new _8(this.widgetAttrs,_3);this.widget.startup();}return this;},validate:function(){if(!this.widget.isValid){return true;}var _9=this.widget.isValid(false);if(!_9){this.widget.state="Error";this.widget._setStateClass();}return _9;}});dojo.declare("Spring.ValidateAllDecoration",[Spring.AbstractValidateAllDecoration,Spring.DefaultEquals],{constructor:function(_a){this.originalHandler=null;this.connection=null;dojo.mixin(this,_a);},apply:function(){var _b=dojo.byId(this.elementId);if(!_b){console.error("Could not apply ValidateAll decoration.  Element with id '"+this.elementId+"' not found in the DOM.");}else{this.originalHandler=_b[this.event];var _c=this;_b[this.event]=function(_d){_c.handleEvent(_d,_c);};}return this;},cleanup:function(){dojo.disconnect(this.connection);},handleEvent:function(_e,_f){if(!Spring.validateAll()){dojo.publish(this.elementId+"/validation",[false]);dojo.stopEvent(_e);}else{dojo.publish(this.elementId+"/validation",[true]);if(dojo.isFunction(_f.originalHandler)){var _10=_f.originalHandler(_e);if(_10==false){dojo.stopEvent(_e);}}}}});dojo.declare("Spring.AjaxEventDecoration",[Spring.AbstractAjaxEventDecoration,Spring.DefaultEquals],{constructor:function(_11){this.validationSubscription=null;this.connection=null;this.allowed=true;dojo.mixin(this,_11);},apply:function(){var _12=dojo.byId(this.elementId);if(!_12){console.error("Could not apply AjaxEvent decoration.  Element with id '"+this.elementId+"' not found in the DOM.");}else{this.validationSubscription=dojo.subscribe(this.elementId+"/validation",this,"_handleValidation");this.connection=dojo.connect(_12,this.event,this,"submit");}return this;},cleanup:function(){dojo.unsubscribe(this.validationSubscription);dojo.disconnect(this.connection);},submit:function(_13){if(this.sourceId==""){this.sourceId=this.elementId;}if(this.formId==""){Spring.remoting.getLinkedResource(this.sourceId,this.params,this.popup);}else{if(this.allowed){Spring.remoting.submitForm(this.sourceId,this.formId,this.params);}}dojo.stopEvent(_13);},_handleValidation:function(_14){if(!_14){this.allowed=false;}else{this.allowed=true;}}});dojo.declare("Spring.RemotingHandler",Spring.AbstractRemotingHandler,{constructor:function(){},submitForm:function(_15,_16,_17){var _18=new Object();for(var key in _17){_18[key]=_17[key];}var _1a=dojo.byId(_15);if(_1a!=null){if(_1a.value!=undefined&&_1a.type&&("button,submit,reset").indexOf(_1a.type)<0){_18[_15]=_1a.value;}else{if(_1a.name!=undefined){_18[_1a.name]=_1a.name;}else{_18[_15]=_15;}}}if(!_18["ajaxSource"]){_18["ajaxSource"]=_15;}dojo.xhrPost({content:_18,form:_16,handleAs:"text",headers:{"Accept":"text/html;type=ajax"},load:this.handleResponse,error:this.handleError});},getLinkedResource:function(_1b,_1c,_1d){this.getResource(dojo.byId(_1b).href,_1c,_1d);},getResource:function(_1e,_1f,_20){dojo.xhrGet({url:_1e,content:_1f,handleAs:"text",headers:{"Accept":"text/html;type=ajax"},load:this.handleResponse,error:this.handleError,modal:_20});},handleResponse:function(_21,_22){var _23=_22.xhr.getResponseHeader("Spring-Redirect-URL");var _24=_22.xhr.getResponseHeader("Spring-Modal-View");var _25=((dojo.isString(_24)&&_24.length>0)||_22.args.modal);if(dojo.isString(_23)&&_23.length>0){if(_25){Spring.remoting.renderURLToModalDialog(_23,_22);return _21;}else{if(_23.indexOf("/")>=0){window.location=window.location.protocol+"//"+window.location.host+_23;}else{var _26=window.location.protocol+"//"+window.location.host+window.location.pathname;var _27=_26.lastIndexOf("/");_26=_26.substr(0,_27+1)+_23;if(_26==window.location){Spring.remoting.getResource(_26,_22.args.content,false);}else{window.location=_26;}}return _21;}}var _28="(?:<script(.|[\n|\r])*?>)((\n|\r|.)*?)(?:</script>)";var _29=[];var _2a=new RegExp(_28,"img");var _2b=new RegExp(_28,"im");var _2c=_21.match(_2a);if(_2c!=null){for(var i=0;i<_2c.length;i++){var _2e=(_2c[i].match(_2b)||["","",""])[2];_2e=_2e.replace(/<!--/mg,"").replace(/\/\/-->/mg,"").replace(/<!\[CDATA\[(\/\/>)*/mg,"").replace(/(<!)*\]\]>/mg,"");_29.push(_2e);}}_21=_21.replace(_2a,"");var _2f=dojo.doc.createElement("span");_2f.id="ajaxResponse";_2f.style.visibility="hidden";document.body.appendChild(_2f);_2f.innerHTML=_21;var _30=new dojo.NodeList(_2f);var _31=_30.query("#ajaxResponse > *").orphan();_30.orphan();if(_25){Spring.remoting.renderNodeListToModalDialog(_31);}else{_31.forEach(function(_32){if(_32.id!=null&&_32.id!=""){var _33=dojo.byId(_32.id);if(!_33){console.error("An existing DOM elment with id '"+_32.id+"' could not be found for replacement.");}else{_33.parentNode.replaceChild(_32,_33);}}});}dojo.forEach(_29,function(_34){dojo.eval(_34);});return _21;},handleError:function(_35,_36){dojo.require("dijit.Dialog");console.error("HTTP status code: ",_36.xhr.status);if(Spring.debug&&_36.xhr.status!=200){var _37=new dijit.Dialog({});dojo.connect(_37,"hide",_37,function(){this.destroyRecursive(false);});_37.domNode.style.width="80%";_37.domNode.style.height="80%";_37.domNode.style.textAlign="left";_37.setContent(_36.xhr.responseText);_37.show();}return _35;},renderURLToModalDialog:function(url,_39){url=url+"&"+dojo.objectToQuery(_39.args.content);Spring.remoting.getResource(url,{},true);},renderNodeListToModalDialog:function(_3a){dojo.require("dijit.Dialog");var _3b=new dijit.Dialog({});_3b.setContent(_3a);dojo.connect(_3b,"hide",_3b,function(){this.destroyRecursive(false);});_3b.show();}});dojo.declare("Spring.CommandLinkDecoration",[Spring.AbstractCommandLinkDecoration,Spring.DefaultEquals],{constructor:function(_3c){dojo.mixin(this,_3c);},apply:function(){var _3d=dojo.byId(this.elementId);if(!dojo.hasClass(_3d,"progressiveLink")){var _3e=new dojo.NodeList(_3d);_3e.addContent(this.linkHtml,"after").orphan("*");_3d=dojo.byId(this.elementId);}_3d.submitFormFromLink=this.submitFormFromLink;return this;},submitFormFromLink:function(_3f,_40,_41){var _42=[];var _43=dojo.byId(_3f);var _44=document.createElement("input");_44.name=_40;_44.value="submitted";_42.push(_44);dojo.forEach(_41,function(_45){var _46=document.createElement("input");_46.name=_45.name;_46.value=_45.value;_42.push(_46);});dojo.forEach(_42,function(_47){dojo.addClass(_47,"SpringLinkInput");dojo.place(_47,_43,"last");});if((_43.onsubmit?!_43.onsubmit():false)||!_43.submit()){dojo.forEach(_42,function(_48){_43.removeChild(_48);});}}});dojo.addOnLoad(Spring.initialize);