/*
 smartComplete 1.1.1
 Licensed under the MIT license.
 https://github.com/VaJoy/smartcComplete
 */
(function ($) {
    $.fn.smartComplete = function (option) {
        option = option || {};
        option = $.extend(true, {
            url:"",
            borderColor:"#bbb",
            actColor:"#ddd",
            method:"post",
            matchPY:!0,   //匹配拼音输入模式下的英文字符
            reg:/'|(^\s+)|(\s+$)/g,   //不希望匹配到的字符
            deffer:300, //防抖延时
            encode:!1  //默认不给数据编码
        }, option);

        var $input,
            up_kc,
            down_kc,
            temp_dkc,
            $ul = $("<ul style='position: absolute;padding:0;margin:0;overflow:hidden;border:solid 1px "+option.borderColor+";'></ul>");

        $ul.on("mouseenter",function(){
            $(this).prev().off("blur", dealKeyEvent);
        }).on("mouseleave", function () {
            $(this).prev().on("blur", dealKeyEvent)
        }).on("mouseenter", "li", function () {  //委托
            $(this).css("background",option.actColor)
        }).on("mouseleave", "li", function () {
            $(this).css("background","white")
        }).on("click", "li", function () {
            var val = $(this).text();
            $(this).parent().prev().val(val).data("acData", "");
            $ul.hide();
        });

        $.fn.smartComplete.dealKeyEvent = $.fn.smartComplete.dealKeyEvent||function(e){
            $input = $(this);
            if(e.type=="focus"){
                if($input.data("acData")) showList($input.data("acData"));
                return;
            }else if(e.type=="blur"){
                $ul.hide();
                return;
            }

            if(!option.matchPY){  //不匹配拼音模式下的未选中字符
                if(e.type==="keydown"){
                    temp_dkc = -1;
                    down_kc = e.keyCode;  //console.log("d ",e.keyCode)
                }else if(e.type==="keyup"){ // console.log("u ", down_kc);
                    up_kc = e.keyCode;
                    if(down_kc==229) judgeKey(1);
                    temp_dkc=-2;
                }else if(e.type==="input"||e.type==="propertychange"){  //console.log("i ",down_kc);
                    if(down_kc!=229) preAjax();
                    else judgeKey(); //chrome下拼音模式按回车
                }
            }else{ //匹配拼音模式下的未选中字符
                if(e.type==="input"||e.type==="propertychange") preAjax();
            }
        };
        var dealKeyEvent = $.fn.smartComplete.dealKeyEvent;

        function judgeKey(isKeyup) {
            if(isKeyup){  //console.log("ku ",up_kc);
                var kc = up_kc,
                    flag = (47 < kc && kc < 58) ? !0 : kc == 13 ? !0 : kc == 32 ? !0 : kc == 16 ? !0 : kc == 191 ? !0 : kc == 220 ? !0 : (95 < kc && kc < 104) ? !0 : !1;
                if(kc==188 && /，$/.test($input.val())) flag=!0; //不匹配用逗号键翻页的情况
                if (flag) preAjax();
            }else{  //chrome下回车的情况
                if ($input.data("acTimeStamp")) clearTimeout($input.data("acTimeStamp"));
                $input.data("acTimeStamp", setTimeout(function () {
                    if (temp_dkc == -1) {
                        preAjax();
                    }
                }, 500))
            }
        }

        $(this).each(function(){
            if($(this).data("bindAc")) $(this).off("keydown keyup input propertychange  focus blur",dealKeyEvent);
            $(this).data("bindAc","1").on("keydown keyup input propertychange focus blur",dealKeyEvent)
        });

        function preAjax() {
            var val = option.reg ? $input.val().replace(option.reg, "") : $input.val();
            if ($input.data("acTimeStamp")) clearTimeout($input.data("acTimeStamp"));
            $input.data("acTimeStamp" , setTimeout(function () {
                    if (!val){ //console.log("none ",val);
                        $ul.hide();
                        $input.data("acBuffer","");
                        return;
                    }else if (val === $input.data('acBuffer')) return;
                    $input.data('acBuffer', val);
                    callAjax(val);
                }, option.deffer  //防抖
            ))
        }

        function callAjax(content) {
            content = option.encode?encodeURIComponent(content):content;
            if(!$input.data("sc_"+content))
            $.ajax({
                data:{content:content},
                url: option.url,
                type: option.method,
                success:function(data){
                    showList(data);
                    $input.data("sc_"+content,data)
                }
            });
            else showList($input.data("sc_"+content));  //数据缓存
        }

        function showList(data){
            $input.after($ul.empty().show());
            if(!data.length){
                $ul.hide();
                $input.data("acData",null);
                return;
            }
            for(var i=0;i<data.length;i++){
                $("<li style='position: relative;width:100%;margin:0;padding:5px;float:left;background: white;'>"+ data[i] +"</li>").appendTo($ul)
            }
            modifyStyle();
            $input.data("acData",data)
        }

        function modifyStyle(){
            var ul_bd = $ul.css("borderLeftWidth").replace("px",""),
                input_bd = $input.css("borderLeftWidth").replace("px","");
            $ul.css({
                left: $input.offset().left  + (ul_bd - input_bd),
                top: $input.offset().top + $input.innerHeight(),
                width: $input.outerWidth() - ul_bd
            })
        }

    }
})(jQuery);

//FF下拼音过程keydown值为0，且监听不到keyup（选中时可监听到）
//Chrome下拼音过程keydown值为229（即使选中），且过程中无法监听回车键（即使选中）