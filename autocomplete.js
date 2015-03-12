/*
 autoComplete 1.0.0
 Licensed under the MIT license.
 https://github.com/VaJoy/autocomplete
 */
(function ($) {
    $.fn.autoComplete = function (option) {
        option = option || {};
        option = $.extend(true, {
            url:"",
            borderColor:"#bbb",
            actColor:"#ddd",
            method:"post",
            matchPY:!0,   //匹配拼音输入模式下的英文字符
            reg:/'|(^\s+)|(\s+$)/g,   //不希望匹配到的字符
            deffer:300 //防抖延时
        }, option);

        var $input,
            up_kc,
            down_kc,
            temp_dkc,
            $ul = $("<ul class='FE-autoComplete' style='position: absolute;padding:0;margin:0;overflow:hidden;border:solid 1px "+option.borderColor+";'></ul>");

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

        $.fn.autoComplete.dealKeyEvent = $.fn.autoComplete.dealKeyEvent||function(e){
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
                    temp_dkc = down_kc = e.keyCode;//console.log("d ",e.keyCode)
                }else if(e.type==="keyup"){ console.log("u ",e.keyCode);
                    up_kc = e.keyCode;
                    if(temp_dkc==229) judgeKey(up_kc);
                    down_kc=-1;
                }else if(e.type==="input"||e.type==="propertychange"){ //console.log("i ",down_kc);
                    if(down_kc==0) preAjax(); //Firefox hack
                    else if(down_kc==-1) preAjax(); //chrome下用鼠标选择拼音项
                    else if(temp_dkc!=229 && temp_dkc!=0) preAjax();
                    down_kc=-2;
                }
            }else{ //匹配拼音模式下的未选中字符
                if(e.type==="input"||e.type==="propertychange") preAjax();
            }
        };
        var dealKeyEvent = $.fn.autoComplete.dealKeyEvent;

        function judgeKey(kc){
            var flag = (47<kc && kc<58)?!0:kc==13?!0:kc==32?!0:kc==16?!0:kc==220?!0:(95<kc && kc<104)?!0:!1;
            if(flag) preAjax();
        }

        $(this).each(function(){
            if($(this).data("bindAc")) $(this).off("keydown keyup input propertychange  focus blur",dealKeyEvent);
            $(this).data("bindAc","1").on("keydown keyup input propertychange focus blur",dealKeyEvent)
        });

        function preAjax() {
            var val = option.reg ? $input.val().replace(option.reg, "") : $input.val();
            if ($input.data("acTimeStamp")) clearTimeout($input.data("acTimeStamp"));
            $input.data("acTimeStamp" , setTimeout(function () {
                    if (!val || val === $input.data('acBuffer')){ //为空或者数值没变
                        $ul.hide();
                        $input.data("acData",null);
                        return;
                    }
                    $input.data('acBuffer', val);
                    callAjax(val);
                }, option.deffer  //防抖
            ))
        }

        function callAjax(data) {
            $.ajax({
                data:{content:data},
                url: option.url,
                type: option.method,
                success:function(data){
                    showList(data)
                }
            })
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