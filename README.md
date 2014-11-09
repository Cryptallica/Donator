Cryptallica Donator
=======

### A JavaScript cryptocurrency donator widget

Using is very simple. Include donator.js and then specifiy by id the html object to transform into the donator.
```html
<div id="donator-example"></div>

<script>
var donatorEx = new CryptDonator("donator-example");
</script>
```

Configuring your donation is simple as well. Open up the config.json file to see how coins are organized. With valid json create objects for each coin with an address attribute. Without the address the coin will not be considered valid. Additionally you can specifiy a label. 
```json
{
  "bitcoin": {
    "address": "1Hyhm23xzUeRKjGCQMxBjmQMXGmtWPcnko",
    "label": "Bitcoins to cryptallica"
  },

  "dogecoin": {
    "address": "D7FZRJijWDtoRmivMB1wHeVJMgH9JAHGc4"
  }
}
```

### Requirements
* Webserver
* Browser with JavaScript

Using Canvas
* Firefox 31+
* IE 9+
* Chrome 31+
* Safari 5.1+
* Opera 24+

Image Fallback
* Firefox 20+
* IE 7+
* Chrome 10+
* Safari 5+
* Opera 10+
