﻿var uaAnonymousGUID = "uaAnonymousGUID";

function uaInit(uaParams)
{
    $(window).load(
		function ()
		{
		    if (uaParams.config.ConfigurationMode)
		    {
		        uaProcessConfig(uaParams);
		    }
		    else
		    {
		        uaProcess(uaParams);
		    }
		}
	);
}

function uaGetUniqID(objVal)
{
    var uniqID = "#" + objVal.attr("id");
    if ((uniqID == "") || (uniqID == null) || (uniqID.indexOf("undefined") != -1))
    {
        uniqID = "[name=\"" + objVal.attr("name") + "\"]";
    }
    if ((uniqID == null) || (uniqID.indexOf("undefined") != -1))
    {
        uniqID = "";
    }
    return uniqID;
}

function getHtmlElementsToDrawUaButton()
{
    var lstResultControls;

    //standard HTML form input control (+  a,input[type="submit"] for events close session)
    var lstControlsStandard = $("input[type=\"text\"],input[type=\"radio\"],input[type=\"checkbox\"],textarea,select,a,input[type=\"submit\"]");

    //Telerik RadEditor
    var lstControlsRadEditor = $(".reContentCell", ".RadEditor");

    // others...

    lstResultControls = $(lstControlsStandard).add(lstControlsRadEditor);/*.add(others)*/
    return lstResultControls;
}

function uaProcessConfig(uaParams)
{
    var lstControls = getHtmlElementsToDrawUaButton();

    if (lstControls.length == 0)
    {
        return;
    }

    $("<link rel=\"stylesheet\" type=\"text/css\" href=\"" + uaParams.path + "ua.css\">").appendTo("head");

    $.each(lstControls,
		function (ind, val)
		{
		    var objVal = $(val);

		    if (objVal.hasClass("uaWizardButton")) //skip  Button StopWizard
		    {
		        return;
		    }

		    var uniqID = uaGetUniqID(objVal);
		    if (uniqID == "") /*|| (uniqID == null) check in uaGetUniqID()  */
		    {
		        //nothing to do with element we can't identify (for now - in this version)
		        return;
		    }

		    var className = (uaParams.config.AutosaveIcon) ? "uaConfig" : "uaConfig uaHidden";

		    //var objType = objVal[0].nodeName + ((objVal.attr("type") == null) ? "" : ("[" + objVal.attr("type") + "]"));
		    //var isEvent = (objType.toLowerCase() == "a") || (objType.toLowerCase() == "input[type=\"submit\"]");
		    var isAncor = $(objVal).prop("nodeName").toLowerCase() == "a";
		    var isSubmit = (objVal.attr("type") !== undefined) && (objVal.attr("type").toLowerCase() == "input[type=\"submit\"]") ? true : false
		    var isEvent = isAncor || isSubmit;

		    if (isEvent)
		    {
		        $.each(uaParams.events, function (ind, val)
		        {
		            if ((val.Selector == uniqID) && (val.Enabled))
		            {
		                className = "uaConfigSelected";
		            }
		        });
		        //insert attribute ua_isevent
		        objVal.after("<div class=\"uaButton\"><a href=\"#\" class=\"" + className + "\" ua=\"" + uniqID + "\" ua_isevent ></a></div>");
		    }
		    else
		    {
		        $.each(uaParams.controls, function (ind, val)
		        {
		            if ((val.Selector == uniqID) && (val.Enabled))
		            {
		                className = "uaConfigSelected";
		            }
		        });
		        //   NOT ! insert attribute rtf_type
		        objVal.after("<div class=\"uaButton\"><a href=\"#\" class=\"" + className + "\" ua=\"" + uniqID + "\"></a></div>");
		    }
		}
	);

    $("a[ua]").click(function () { return uaConfigClick(this, uaParams); });
}

function uaConfigClick(uaButton, uaParams)
{
    var objThis = $(uaButton);
    var action = (objThis.hasClass("uaConfigSelected")) ? "removeControl" : "addControl";
    //var objSelector = $(objThis.attr("ua"));

    var isEvent = objThis.attr("ua_isevent") !== undefined ? true : false
    //var objType = objSelector[0].nodeName + ((objSelector.attr("type") == null) ? "" : ("[" + objSelector.attr("type") + "]"));
    objThis.addClass("uaProgress");

    var typeRTFEditor = getTypeEditorByUaButton(uaButton, uaParams);

    $.get(
		uaParams.path + "UAHandler.aspx",
		{ configurationID: uaParams.config.ConfigurationID, action: action, selector: objThis.attr("ua"), IsEvent: isEvent /*type: objType*/, RTFEditor: typeRTFEditor },
		function (data)
		{
		    objThis.removeClass("uaProgress");
		    if (data == "1")
		    {
		        if (action == "removeControl")
		        {
		            objThis.removeClass("uaConfigSelected").addClass("uaConfig");
		        }
		        else
		        {
		            objThis.removeClass("uaConfig").addClass("uaConfigSelected");
		        }
		    }
		    else
		    {
		        alert(data);
		    }
		}
	);
    return false;
}

function uaProcess(uaParams)
{
    if ((uaParams.controls.length == 0) && (uaParams.events.length == 0))
    {
        return;
    }
    else
    {
        $("<link rel=\"stylesheet\" type=\"text/css\" href=\"" + uaParams.path + "ua.css\">").appendTo("head");
        var anon = dnn.dom.getCookie(uaAnonymousGUID);
        if ((uaParams.anonymousGUID != "") && (anon == null))
        {
            dnn.dom.setCookie(uaAnonymousGUID, uaParams.anonymousGUID, 365, "/");
        }
    }

    $.each(uaParams.events, function (ind, val)
    {
        if (val.Enabled)
        {
            $(val.Selector).click(function () { uaCloseSession(uaParams); });
        }
    });

    $.each(uaParams.controls,
		function (ind, val)
		{
		    var objVal = $(val.Selector);
		    if ((val.Enabled))
		    {
		        var attrClassValue = (uaParams.config.AutosaveIcon) ? "uaWork" : "uaWork uaHidden";
		        var attrUaValue = val.Selector;
		        var attrRTFType = val.RTFType != "" ? "rtf_type=\"" + val.RTFType + "\"" : ""; //insert attribute only if is RTFType
		        objVal.after("<div class=\"uaButton\"><a href=\"#\" class=\"" + attrClassValue + "\" ua=\"" + attrUaValue + "\" " + attrRTFType + "></a></div>");
		        var uaButton = $("a[ua=\"" + val.Selector + "\"]");

		        //TODO
		        //restore values
		        if (val.RestoreOnLoad)
		        {
		            var value = doActionByUaButton(uaButton, "get_value", null, uaParams);
		            uaButton.attr("uaOldValue", value) //add and set attr uaOldValue

		            if (val.RestoreIfEmpty)
		            {
		                if (value == "")
		                {
		                    doActionByUaButton(uaButton, "set_value", val.Value, uaParams);
		                }
		            }
		            else
		            {
		                doActionByUaButton(uaButton, "set_value", val.Value, uaParams);
		            }
		        }
		    }
		}
	);


    var allUaButtons = $("a[ua]");

    if (allUaButtons.length > 0)
    {
        allUaButtons.click(function () { return uaWorkClick(this, uaParams); });

        //Handler for controls && autosave onBlur handler
        if (uaParams.config.AutosaveOnBlur)
        {
            $.each($(allUaButtons),
					function (ind, uaButton)
					{
					    doActionByUaButton(uaButton, "set_handle", null, uaParams);
					}
			 );
        }

        //Autosave interval handler
        if (uaParams.config.AutosavePeriod != 0)
        {
            uaParams.intervalID = setInterval(
									function ()
									{
									    $.each(allUaButtons,
											function (ind, uaButton)
											{
											    uaTrackChanges(uaButton, uaParams/*this*/);
											}
										);
									},
									uaParams.config.AutosavePeriod * 1000);
        }
    }
}

function doActionByUaButton(_uaButton, action, value, uaParams)
{
    //action in (get_value, set_value, set_handle, set_focus)
    var uaButton = $(_uaButton);

    switch (getTypeEditorByUaButton(uaButton, uaParams))
    {
        case "dotnetnuke.radeditorprovider":
            var objRadEditor = $find(uaButton.closest(".RadEditor").attr("id"));
            if (action == "get_value")
            {
                return objRadEditor.get_html();
            }
            if (action == "set_value")
            {
                objRadEditor.set_html(value);
            }
            if (action == "set_handle")
            {
                objRadEditor.attachEventHandler("focusout", function (e) { uaTrackChanges(uaButton, uaParams); });
            }
            if (action == "set_focus")
            {
                objRadEditor.setFocus();
            }
            break

        case "":
            var objHTMLCtl = $(uaButton.attr("ua"));
            if (action == "get_value")
            {
                return objHTMLCtl.val();
            }
            if (action == "set_value")
            {
                objHTMLCtl.val(value);
            }
            if (action == "set_handle")
            {
                objHTMLCtl.blur(function () { uaTrackChanges(uaButton, uaParams); });
            }
            if (action == "set_focus")
            {
                objHTMLCtl.focus();
            }

            break

        default:
            //statements_def
            break
    }

}

function getTypeEditorByUaButton(_uaButton, uaParams)
{
    //if return "" then standard HTML control
    var uaButton = $(_uaButton);
    var result;
    //var tmp;

    //find Telerik RadEditor
    //tmp = uaButton.attr("rtf_type")!== undefined ? true : false;

    if (uaParams.config.ConfigurationMode)
    {
        result = uaButton.closest(".RadEditor").hasClass("RadEditor") ? "dotnetnuke.radeditorprovider" : "-1";
        //////////////
        //find others...
        /////////////
    }
    else
    {
        if (uaButton.attr("rtf_type") !== undefined)
        {
            result = uaButton.attr("rtf_type");
        }
        else
        {
            result = "-1";
        }
    }
    if (result == "-1") //standard HTML control
    {
        return "";
    }
    else
    {
        return result;
    }

    //check is standard HTML control
    // tmp = uaButton.closest("[class=\"uaButton\"]").prev();
    // if ((("#" + tmp.attr("id")) == uaButton.attr("ua")) && (tmp.prop("nodeName").toLowerCase() == "input"))
    // {
    // result = "";
    // }

}

function uaTrackChanges(_uaButton, uaParams)
{
    uaButton = $(_uaButton);
    var oldValue = uaButton.attr("uaOldValue");
    var newValue = doActionByUaButton(uaButton, "get_value", null, uaParams);


    var isModified = false;

    if (oldValue == null)
    {
        if (newValue != "")
        {
            isModified = true;
            uaButton.attr("uaOldValue", "");
        }
    }
    else
    {
        if ((oldValue != newValue) && (newValue != ""))
        {
            isModified = true;
        }
    }

    if (isModified)
    {
        uaButton.addClass("uaProgress");
        var objSend = new Object();
        objSend.configurationID = uaParams.config.ConfigurationID;
        objSend.action = "trackChanges";
        objSend.value = newValue;
        objSend.selector = uaButton.attr("ua");
        objSend.anonymousGUID = dnn.dom.getCookie(uaAnonymousGUID);
        objSend.urlID = uaParams.urlID;

        $.ajax({
            type: "POST",
            async: true,
            url: uaParams.path + "UAHandler.aspx",
            data: objSend,
            contentType: "application/json",
            dataType: "json",
            success: function (msg)
            {
                if (msg != "1")
                {
                    alert(msg);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown)
            {
                alert(textStatus);
            }
        });

        uaButton.attr("uaOldValue", newValue);

        uaButton.removeClass("uaProgress");
    }
}

function uaWorkClick(uaButton, uaParams)
{
    $("#uaPopup").dialog(
	{
	    modal: true,
	    closeOnEscape: true,
	    width: "75%",
	    height: 300,
	    title: $("#uaPopup span.uaHidden").html()
	});

    uaGetHistory(uaButton, uaParams);

    return false;
}

function uaGetHistory(uaButton, uaParams)
{
    var objSend = new Object();
    objSend.configurationID = uaParams.config.ConfigurationID;
    objSend.action = "getHistory";

    //objSend.selector = uaGetUniqID($($(src).attr("ua")));
    objSend.selector = $(uaButton).attr("ua");

    objSend.anonymousGUID = dnn.dom.getCookie(uaAnonymousGUID);
    objSend.urlID = uaParams.urlID;

    $.ajax({
        type: "POST",
        async: true,
        url: uaParams.path + "UAHandler.aspx",
        data: objSend,
        contentType: "application/json",
        dataType: "text",
        success: function (msg)
        {
            $("#uaPopup span.NormalRed").hide();
            $("#uaPopup div").html(msg);

            var buttons = $("#uaPopup").dialog("option", "buttons");
            //debugger;
            //if (buttons.length == 0)
            //{
                var objDiff = $("#uaPopup a.uaHidden");
                $("#uaPopup").dialog("option", "buttons", [{ text: objDiff.html(), click: function () { objDiff.click(); } }]);
            //}

            //set handles 
            $("#uaPopup div a.uaButtonShowDiff").click(function (event)
            {
                onClickButtonShowDiff(this, event, uaParams);
                return false;
            });

            $("#uaPopup div table tr td.value").click(function (event)
            {
                uaRestoreValue(this, event, uaParams);
            });
            //end set handles 

        },
        error: function (XMLHttpRequest, textStatus, errorThrown)
        {
            alert(textStatus);
        }
    });
}

function uaShowDiff(warnMessage, path)
{
    var checkbox = $("#uaPopup div table input[valueid]:checkbox:checked");
    if (checkbox.length == 2)
    {
        $("#uaDiff").dialog(
		{
		    modal: true,
		    closeOnEscape: true,
		    width: "90%",
		    height: 550,
		    title: $("#uaDiff span.uaHidden").html(),
		});

        var objSend = new Object();
        objSend.action = "getDiff";
        objSend.idValue1 = checkbox.eq(0).attr("valueid");
        objSend.idValue2 = checkbox.eq(1).attr("valueid");
        $.ajax({
            type: "POST",
            async: true,
            url: path + "UAHandler.aspx",
            data: objSend,
            contentType: "application/json",
            dataType: "text",
            success: function (msg)
            {
                $("#uaDiff span.NormalRed").hide();
                $("#uaDiff div").html(msg);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown)
            {
                alert(textStatus);
            }
        });
    }
    else
    {
        alert(warnMessage);
    }
    return false;
}

function uaDiffChecked(sender)
{
    if ($(sender).attr("checked"))
    {
        var lstCB = $("#uaPopup input:checkbox:checked[timeStamp]");
        if (lstCB.length > 1)
        {
            var objMin = null;
            $.each(lstCB, function (ind, val)
            {
                if (objMin == null)
                {
                    objMin = val;
                    return true;
                }
                if (parseInt($(objMin).attr("timeStamp")) > parseInt($(val).attr("timeStamp")))
                {
                    objMin = val;
                }
            }
            );
            $(objMin).attr("checked", false).removeAttr("timeStamp");
        }
        $(sender).attr("timeStamp", (new Date()).getTime());
    }
}

function uaRestoreValue(sender, event, uaParams)
{
    var uaButton = $("a[ua=" + $(sender).closest("tr").attr("ua") + "]");
    var restoreValue;
    var typeEditor = getTypeEditorByUaButton(uaButton, uaParams);

    if (typeEditor != "")
    {
        restoreValue = $("div.fullTextHtml", $(sender)).html();
    }
    else
    {
        restoreValue = $(sender).html();
    }

    doActionByUaButton(uaButton, "set_value", restoreValue, uaParams);
    doActionByUaButton(uaButton, "set_focus", null, uaParams);
    $("#uaPopup").dialog("close");
}

function uaCloseSession(uaParams)
{
    var objSend = new Object();
    objSend.configurationID = uaParams.config.ConfigurationID;
    objSend.action = "closeSession";
    objSend.anonymousGUID = dnn.dom.getCookie(uaAnonymousGUID);
    objSend.urlID = uaParams.urlID;

    $.ajax({
        type: "POST",
        async: true,
        url: uaParams.path + "UAHandler.aspx",
        data: objSend,
        contentType: "application/json",
        dataType: "text",
        success: function (msg)
        {
            if (msg != "1")
            {
                alert(msg);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown)
        {
        }
    });
}