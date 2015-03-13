# smartComplete
smartComplete is a light-level plugin based on jQuery1.7+.
It allows you to get the data from the SERVER and then generates the data-list to choose intelligently.
smartComplete has the DATA-CATCH mechanism inside to help reducing redundant requests effectively.
# Usage
import jQuery and smartComplete.js to your page file,and then use `$("input").smartComplete([OPTION])` to setup the plugin.
e.g.
```javascript
    $("#a").smartComplete({
      url:"result.json",  //url of SERVER
      ulClass:"abc"
    });

    $("div>input").smartComplete({
      url:"result.json",
      matchPY:!1,   //ignore the typing procedure under PINYIN mode
      actFontColor:"red",
      callback:function(data){
        console.log(data.id,data.text)
      }
    });
```
# Option
### url
path of the SERVER, for Ajax calling.
### ulClass
name of the class which will add to the data-list(`ul` DOM).
e.g.
```html
    <style>
    .abc>li:nth-child(odd){
        background: #FFFFBF !important;
    }
    .abc>li:hover{
        background: #BFFFBF !important;
        color:#FF8000 !important;
        font-weight: bold;
    }
    </style>
    <script>
    $("#a").smartComplete({
        url:"result.json",  //url of SEVER
        ulClass:"abc"
        });
    </script>
```
### borderColor
color of data-list border,`#bbb` as default
### fontColor
font color of data-list,`black` as default
### actBgColor
background color of data-list item(`li` DOM) as you hover it,`#ddd` as default
### actFontColor
font color of data-list item(`li` DOM) as you hover it,`black` as default
### fontSize
font size of data-list,`12px` as default
### lineHeight
line-height of data-list items,`16px` as default
### maxHeight
max-height of data-list,`150px` as default
### method
request method of Ajax,`post` as default
### matchPY
BOOLEAN value, determine to match the typing procedure under PINYIN（拼音） mode whether or not,`TRUE` as default
### reg
regular expression which will filter the input value,`/'|(^\s+)|(\s+$)/g` as default
### defer
request defer time,`300`(ms) as default
### zIndex
z-index of data-list,`9999999` as default
### encode
BOOLEAN value, determine to encode(by `encodeURIComponent`) the data(input value) which will send to the SERVER whether or not,`FALSE` as default
### callback
callback function, which will be involked as you select the data-list item.
it has one param as the data object of the list item you`ve chosen.
e.g.
```javascript
    $("div>input").smartComplete({
        url:"result.json",
        callback:function(data){
        console.log(data.id,data.text)
        }
    });
```
# License
MIT © [VaJoy Larn](https://github.com/VaJoy)
