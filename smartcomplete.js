/*
 smartComplete 1.1.1
 Licensed under the MIT license.
 https://github.com/VaJoy/smartcComplete
 */
(function ($) {
    $.fn.smartComplete = function (option) {
        option = option || {};
        option = $.extend(true, {
            url: "",
            ulClass: "",
            borderColor: "#bbb",
            fontColor:"black",
            actBgColor: "#ddd",
            actFontColor: "black",
            method: "post",
            matchPY: !0,   //匹配拼音输入模式下的英文字符
            reg: /'|(^\s+)|(\s+$)/g,   //不希望匹配到的字符
            deffer: 300, //防抖延时
            zIndex:"9999999",
            encode: !1  //默认提交数据不编码
        }, option);

        var $input,
            up_kc,
            down_kc,
            temp_dkc,
            $ul = $("<ul" + (option.ulClass ? (" class='" + option.ulClass + "'") : "")
            + " style='position:absolute;padding-left:0;margin:0;list-style:none;z-index:"+option.zIndex+";overflow:hidden;border:solid 1px " + option.borderColor + ";'></ul>");
        $ul.on("mouseenter", function () {
            $(this).prev().off("blur", dealKeyEvent);
        }).on("mouseleave", function () {
            $(this).prev().on("blur", dealKeyEvent)
        }).on("mouseenter", "li", function () {  //委托
            $(this).css({"background":option.actBgColor,"color":option.actFontColor})
        }).on("mouseleave", "li", function () {
            $(this).css({"background":"white","color":option.fontColor})
        }).on("click", "li", function () {
            var val = $(this).text();
            $(this).parent().prev().val(val).data("acData", "");
            $ul.hide();
        });

        /**
         * deal with key-press events
         * @param e {object} - event handler
         */
        $.fn.smartComplete.dealKeyEvent = function (e) {
            $input = $(this);
            if (e.type == "focus") {
                if ($input.data("acData")) showList($input.data("acData"));
                return;
            } else if (e.type == "blur") {
                $ul.hide();
                return;
            }

            if (!option.matchPY) {  //不匹配拼音模式下的未选中字符
                if (e.type === "keydown") {
                    temp_dkc = -1;
                    down_kc = e.keyCode;  //console.log("d ",e.keyCode)
                } else if (e.type === "keyup") { // console.log("u ", down_kc);
                    up_kc = e.keyCode;
                    if (down_kc == 229) judgeKey(1);
                    temp_dkc = -2;
                } else if (e.type === "input" || e.type === "propertychange") {  //console.log("i ",down_kc);
                    if (down_kc != 229) preAjax();
                    else judgeKey(); //chrome下拼音模式按回车
                }
            } else { //匹配拼音模式下的未选中字符
                if (e.type === "input" || e.type === "propertychange") preAjax();
            }
        };
        var dealKeyEvent = $.fn.smartComplete.dealKeyEvent;

        /**
         * judge the EFFECTIVE key while typing in PINYIN mode
         * @param isKeyup {boolean} - check for KeyUp event as TRUE
         */
        function judgeKey(isKeyup) {
            if (isKeyup) {
                var kc = up_kc,
                    flag = (47 < kc && kc < 58) ? !0 : kc == 13 ? !0 : kc == 32 ? !0 : kc == 16 ? !0 : kc == 191 ? !0 : kc == 220 ? !0 : (95 < kc && kc < 104) ? !0 : !1;
                if (kc == 188 && /，$/.test($input.val())) flag = !0; //不匹配用逗号键翻页的情况
                if (flag) preAjax();
            } else {  //chrome下回车的情况
                if ($input.data("acTimeStamp")) clearTimeout($input.data("acTimeStamp"));
                $input.data("acTimeStamp", setTimeout(function () {
                    if (temp_dkc == -1) {
                        preAjax();
                    }
                }, 500))
            }
        }

        //starts here
        $(this).each(function () {
            if ($(this).data("bindAc")) $(this).off("keydown keyup input propertychange  focus blur", dealKeyEvent);
            $(this).data("bindAc", "1").data("sc-priorNum",0).on("keydown keyup input propertychange focus blur", dealKeyEvent);
        });

        /**
         * filter data before and reduce AJAX requests
         */
        function preAjax() {
            var val = option.reg ? $input.val().replace(option.reg, "") : $input.val();
            if ($input.data("acTimeStamp")) clearTimeout($input.data("acTimeStamp"));
            $input.data("acTimeStamp", setTimeout(function () {
                    if (!val) {
                        $ul.hide();
                        $input.data("acBuffer", "");
                        return;
                    } else if (val === $input.data('acBuffer')) return;
                    $input.data('acBuffer', val);
                    callAjax(val);
                }, option.deffer  //防抖
            ))
        }

        /**
         * deal with AJAX request
         * @param content {string} - input value as data
         */
        function callAjax(content) {
            var priorNum = $input.data("sc-priorNum")+1;
            $input.data("sc-priorNum",priorNum);
            content = option.encode ? encodeURIComponent(content) : content;
            if (!$input.data("sc_" + content))
                $.ajax({
                    data: {content: content},
                    url: option.url,
                    type: option.method,
                    success: function (data) {
                        $input.data("sc_" + content, data);
                        var pNum = $input.data("sc-priorNum");
                        if (pNum <= priorNum) {   //处理异步返回数据，抛弃旧请求的数据展示
                            showList(data);
                        }
                    }
                });
            else showList($input.data("sc_" + content));  //数据缓存
        }

        /**
         * show the data-list out
         * @param data {object} - ARRAY object as data
         */
        function showList(data) {
            $input.after($ul.empty().show());
            if (!data.length) {
                $ul.hide();
                $input.data("acData", null);
                return;
            }
            for (var i = 0; i < data.length; i++) {
                $("<li style='position: relative;width:100%;margin:0;padding:5px;float:left;background: white;'>" + data[i] + "</li>").appendTo($ul)
            }
            modifyStyle();
            $input.data("acData", data)
        }

        /**
         * modify style of the data-list, it sucks!!
         * sometime u`d better add the "ulClass" option to fix it
         */
        function modifyStyle() {
            var ul_bd = Number($ul.css("borderLeftWidth").replace("px", "")),
                input_bd = Number($input.css("borderLeftWidth").replace("px", "")),
                input_ml = Number($input.css("marginLeft").replace("px", "")),
                input_mt = Number($input.css("marginTop").replace("px", "")),
                top = $input.outerHeight() - input_bd + input_mt;
            if ($input.parent().css("position") === "static") $input.parent().css("position","relative");
            $ul.css({
                left: $input.position().left + (ul_bd - input_bd) + Number(input_ml),
                top: top,
                width: $input.outerWidth() - ul_bd
            })
        }

    }
})(jQuery);

//FF下拼音过程keydown值为0，且监听不到keyup（选中时可监听到）
//Chrome下拼音过程keydown值为229（即使选中），且过程中无法监听回车键（即使选中）