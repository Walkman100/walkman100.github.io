var total_msg = '';
var any_error = false;
var first = true;  //Track if the first access of checkError

// Initialize the validation
function init(form,target) {
  total_msg = '';
  any_error = false;

  // Remove any errors.
  var targetEl = document.getElementById(target);
  if (targetEl) {
    var targetContentEl = targetEl.lastChild;
    if (targetContentEl) {
      targetEl.removeChild(targetContentEl);

      // Check whether the field has the getAttribute method. If so, remove
      // the 'error' class.
      for (var field in form.elements) {
        if (form.elements[field] //For IE
            && form.elements[field].getAttribute
            && form.elements[field].getAttribute("className") == "error") {
          form.elements[field].removeAttribute("class");
          form.elements[field].removeAttribute("className"); // For IE
        }
      }
    }
  }
}

// Resets validation history, sets global variable 'first' to true
function resetValidation(){
  first = true;
}

//Display all error messages
// returns true if no error, false if there are errors
function checkErrors(form,target,alert_msg) {
  first = false;
  if (any_error) {
    errorTable = document.createElement("table");
    errorTable.id = "errorTable";
    errorTB = document.createElement("tbody");
    errorTR = document.createElement("tr");
    errorTD = document.createElement("td");
    errorTD.style.border = "1px solid #c00";
    errorTD.style.padding = "6px";
    errorBold = document.createElement("b");
    errorBold.style.color = "#c00";

    //If we received a universal alert message use that instead of the loop
    if (alert_msg != "" && typeof(alert_msg) != 'undefined') {
      alert_msg = alert_msg.replace(/\|/g, "");
      msg = document.createTextNode(alert_msg);
      errorBold.appendChild(msg);
    } else {
      //Loop to display each error message
      var msgArray = total_msg.split("|");
      for (i=0;i < msgArray.length;i++) {
        msg = document.createTextNode(msgArray[i]);
        errorBold.appendChild(msg);
        errorBold.appendChild(document.createElement("br"));
      }
      errorBold.removeChild(errorBold.lastChild);  //Remove trailing break
    }

    errorTD.appendChild(errorBold);
    errorTR.appendChild(errorTD);
    errorTB.appendChild(errorTR);
    errorTable.appendChild(errorTB);
    var targetEl = document.getElementById(target);
    if (targetEl) {
      targetEl.appendChild(errorTable);
    }
    window.scroll(0,0);
    return false;
  }

  //document.styleSheets[0].deleteRule(0);
  return true;
}

function validate() {
  var args = validate.arguments;

  // Standard arguments
  var type = args[0];
  var field = args[1];
  var alert_msg = args[2];

  var error = false;  // Is there an error with this validation?
  var error_undefined_field = false;
  var highlight = false;  // Should this field be highlighed if error is found?
  var url_pattern;

  if (field == null) {
    error_undefined_field = true;
  } else {

    switch(type) {
      case "minage":
        //Can't use highlight. Age comes from 3 fields, which breaks code
        var minage = (args[3] ? args[3]: 18);
        var default_msg = "You must be at least " + minage;
        default_msg = default_msg + " to submit this form";

        var age_cookie = getCookie(args[4], ';');
        //check if the cookie is already set

        if (age_cookie == '1') {
          error = true;
        } else {
          //date user turns minage
          var minage_on_date = new Date(field.getUTCFullYear() + minage,
              field.getUTCMonth(), field.getUTCDate());
          var today = new Date();
          if (today < minage_on_date) {
            //Set a non-persistant cookie
            setCookies_default(args[4], '1', '', -1);
            error = true;
          }
        }
        break;

      case "content":
        var highlight = true;
        var default_msg = "Please fill in all required fields.";
        if (field.value == "") {
          error = true;
        }
        break;

      case "length":
      case "maxlength":
        max_length = (args[3]?args[3]:1000);
        var highlight = true;
        var default_msg = "Please enter less than " + max_length + " characters. (currently " + field.value.length + " characters)";
        if (field.value.length > max_length) {
          alert_msg = alert_msg.replace(/%NUM_CHARS/i, field.value.length);
          alert_msg = alert_msg.replace(/%MAX_LENGTH/i, max_length);
          error = true;
        }
        break;

      case "minlength":
        min_length = (args[3]?args[3]:1);
        var highlight = true;
        var default_msg = "Please enter more than " + min_length
            + " characters. (currently " + field.value.length + " characters)";
        if (field.value.length < min_length) {
          alert_msg = alert_msg.replace(/%NUM_CHARS/i, field.value.length);
          alert_msg = alert_msg.replace(/%MIN_LENGTH/i, min_length);
          error = true;
        }
        break;

      case "time":
        var highlight = true;
        var default_msg = "Please enter a valid time.";
        time_pattern = /^[1-9]\:[0-5][0-9]\s*(\AM|PM|am|pm?)\s*$/;
        time_pattern2 = /^[1-1][0-2]\:[0-5][0-9]\s*(\AM|PM|am|pm?)\s*$/;
        time_pattern3 = /^[1-1][0-2]\:[0-5][0-9]\:[0-5][0-9]\s*(\AM|PM|am|pm?)\s*$/;
        time_pattern4 = /^[1-9]\:[0-5][0-9]\:[0-5][0-9]\s*(\AM|PM|am|pm?)\s*$/;

        if (field.value != "") {
          if (!time_pattern.test(field.value)
              && !time_pattern2.test(field.value)
              && !time_pattern3.test(field.value)
              && !time_pattern4.test(field.value)) {
            error = true;
          }
        }
        break;

      case "email":
        error = isEmailInvalid(field);
        var highlight = true;
        var default_msg = "Please enter a valid email address.";
        break;

      case "date":
        var highlight = true;
        var default_msg = "Please enter a valid date.";
        date_pattern = /^(\d{1}|\d{2})\/(\d{1}|\d{2})\/(\d{2}|\d{4})\s*$/;
        if (field.value != "") {
          if (!date_pattern.test(field.value) || !isDateValid(field.value)) {
            error = true;
          }
        }
        break;

      case "not_equal":
        var highlight = true;
        var value2 = args[3];
        var default_msg = "The two fields cannot be equal.";
        if (field.value == value2) {
          error = true;
        }
        break;

      case "regex":
        var highlight = true;
        var default_msg = "Please enter a valid value.";

        url_pattern = args[3];
        if (field.name != "") {
          if (!url_pattern.test(field.value)) {
            error = true;
          }
        }
        break;

      case 'negateRegex':
        var highlight = true;
        var default_msg = 'Please enter a valid value.';
        url_pattern = args[3];
        if (field.name != '') {
          if (url_pattern.test(field.value)) {
            error = true;
          }
        }
        break;

      case "notgmail":
        var highlight = false;
        var default_msg = "Please enter a non-Gmail address.";
        gmail_pattern = new RegExp("^[^ ]+\@("+"gmail"+")\.[^ ]+$");
        googlemail_pattern = new RegExp("^[^ ]+\@("+"googlemail"+")\.[^ ]+$");
        if (field.value != "") {
          if (gmail_pattern.test(field.value.toLowerCase())
              || googlemail_pattern.test(field.value.toLowerCase())) {
            highlight=true;
            error = true;
          }
        }
        break;

      case "url":
        var highlight = true;
        var default_msg = "Please enter a valid URL.";
        /* Allow:
         * www.google (It's too much work to whitelist all valid TLDs)
         * google.com
         * http://google.com
         * http://www.google.com
         * https://maps.google.com/foo.html
         *
         * Don't allow:
         * google
         * google/foo.html
         * g$gle.com
         * http:/google.com
         * */
        url_pattern = new RegExp(
          /^((http|https|mms):\/\/)?[\w-]+\.[\w-]+(\.[\w-]+)*([\/].*)?$/
        );
        if (field.name != "") {
          if (!url_pattern.test(field.value)) {
            error = true;
          }
        }
        break;

      case "accountVerificationLink":
        // http://www.google.com/accounts/VE
        var highlight = true;
        var default_msg = "Please enter a valid URL.";
        url_pattern = /^(\http:\/\/www\.google\.com\/accounts\/VE)/;
        if (field.name != "") {
          if (!url_pattern.test(field.value)) {
            error = true;
          }
        }
        break;

      case "bloggerurl":
        // http://YourBlogName.blogspot.com
        var highlight = true;
        var default_msg = "Please enter a valid URL.";

        url_pattern = /^(\http:\/\/[A-Za-z0-9_-]*\.blogspot(\.com|\.com\/))$/;
        if (field.name != "") {
           if (!url_pattern.test(field.value)) {
            error = true;
          }
        }
        break;

      case "orkuturl":
        //orkut profile starts with http://www.orkut.com/Profile.aspx?uid= and has a UID of at least 8 digits
        var highlight = true;
        var default_msg = "Please enter a valid URL.";

        url_pattern = /^(\http:\/\/www\.orkut\.com\/Profile\.aspx\?uid=)\d{8,50}\s*$/;  //limit UID to 50 digits
        if (field.name != "") {
           if (!url_pattern.test(field.value)) {
            error = true;
          }
        }
        break;

      case "exactmatch":
        var highlight = true;
        var default_msg = "Invalid value. Please check.";
        error = true;
        for (i = 0; i < args[3].length; i++) {
          if (args[3][i] == field.value) {
            error = false;
            break;
          }
        }
        break;

      case "substring":
        var highlight = true;
        var default_msg = "Invalid value. Please check.";
        if (args[1].value.indexOf(args[3]) == -1){
          error = true;
        }
        break;

      case "zipcode":
        var highlight = true;
        var default_msg = "Please enter a valid zipcode.";
        zip_pattern = /^\d{5}(\-?\d{4})?$/;
        if (field.value != "") {
          if (!zip_pattern.test(field.value)) {
            error = true;
          }
        }
        break;

      case "number":
        var highlight = true;
        var default_msg = "Please enter a valid number. Only 0-9 characters are allowed, no letters or symbols.";
        number_pattern = /^\d+$/;
        if (field.value != "") {
          if (!number_pattern.test(field.value)) {
            error = true;
          }
        } else {
          error = true;
        }
        break;

      case "checkboxes":
        min_checked = args[3];
        max_checked = args[4];
        var box = 0;
        var count = 0;
        var default_msg = "Please check an item from the list.";

        var area = document.getElementById(field);

        if (area == null) {
          error_undefined_field = true
        } else {
          var inputs = area.getElementsByTagName('input');

          for (box = 0; box < inputs.length; box++) {
            if (inputs[box].checked) {
              count = count + 1;
            }
          }

          if (count < min_checked || count > max_checked) {
            error = true;
          }
        }
        break;

      case "checkbox":
        min_checked = args[3];
        max_checked = args[4];
        var default_msg = "Please check an item from the list.";
        var count = 0;

        if (!field.length && !field.checked) {
          error = true;
        } else {
          for (var i = 0; i < field.length; i++) {
            if (field[i].checked) {
              count++;
            }
          }
          if (count < min_checked) {
            error = true;
          }
          if (max_checked != "" && max_checked != null) {
            if (count > max_checked) {
              error = true;
            }
          }
        }
        break;

      case "select":
        var highlight = true;
        var default_msg = "Please select an option from the pulldown.";
        if (field.value == "") {
          error = true;
        }
        break;

      case "radio":
        var default_msg = "Please select an option from the radio buttons.";
        is_checked = false;
        for (i = 0; i < field.length; i++) {
          if (field[i].checked) {
            is_checked = true;
          }
        }
        if (!is_checked) {
          error = true;
        }
        break;

      case "exactmatch_radio":
        var default_msg = "Please select an option from the radio buttons.";
        error = true;
        for (i = 0; i < field.length; i++) {
          if (field[i].checked) {
            for (j = 0; j < args[3].length; j++) {
              if (args[3][j] == field[i].value) {
                error = false;
                break;
              }
            }
          }
        }
        break;

      case "exactmatch_radio2":
        var default_msg = "Please select an option from the radio buttons.";
        error = true;
        for (i= 0; i < field.length; i++) {
          if (field[i].checked) {
            if (args[3] == field[i].value){
              error = false;
              break;
            }
          }
        }
        break;

      case "file":
        valid_ext = args[3];
        var default_msg = "Please enter a valid file attachment.";
        file_pattern = new RegExp("^.+\.("+valid_ext+")$");
        if (field.value != "") {
          if (!file_pattern.test(field.value)) {
            error = true;
          }
        } else  {
          error=true;
        }
        break;

      case "valid_email_domain":
        var highlight = true;
        var default_msg = "Please enter a valid email domain.";
        error = checkInvalidDomain(field);
        break;
    }
  }


  // An attempt to validate on a non-existent field
  // If internal, show an error.
  if (error_undefined_field && internal) {
    error = true;
    alert_msg = 'INTERNAL ERROR: Validating for ' + type
        + ' on a field that doesn\'t exist!';
  }
  // If external, track error but allow user to submit the form.
  else if (error_undefined_field) {
    track('Contact form error', 'Validate non-existent field');
  }



  if (alert_msg == "" || alert_msg == null) alert_msg = default_msg;
  if (error) {
    any_error = true;
    total_msg = total_msg + alert_msg + "|";
  }
  if (error && highlight) {
    field.setAttribute("class","error");
    field.setAttribute("className","error");    // For IE
  }
}

function isDateValid(dateString) {
  var daysInMonth = new Array(13);
  daysInMonth[1] = 31;
  daysInMonth[2] = 29;
  daysInMonth[3] = 31;
  daysInMonth[4] = 30;
  daysInMonth[5] = 31;
  daysInMonth[6] = 30;
  daysInMonth[7] = 31;
  daysInMonth[8] = 31;
  daysInMonth[9] = 30;
  daysInMonth[10] = 31;
  daysInMonth[11] = 30;
  daysInMonth[12] = 31;

  var theDate = dateString.split("/");

  var intYear = parseInt(theDate[2],10);
  var intMonth = parseInt(theDate[0],10);
  var intDay = parseInt(theDate[1],10);

  if (intMonth < 1 || intMonth > 12 ) return false;
  if (intDay > daysInMonth[intMonth]) return false;
  if ((intMonth == 2) && (intDay > daysInFebruary(intYear))) return false;

  return true;
}

function daysInFebruary(year) {
  return (  ((year % 4 == 0) && ( (!(year % 100 == 0)) || (year % 400 == 0) ) ) ? 29 : 28 );
}

function resetForms(w) {
  if (!w) {
    w = window;
  }
  if(document.forms.length>0)  {
    for(var i = 0; i < document.forms.length; i++)  {
      document.forms[i].reset();
    }
  }
  if(document.layers){
    for(var j = 0; j < w.document.layers.length; j++) {
      resetForms(w.document.layers[j]);
    }
  }
}

/**
 * Checks to see if email domain is invalid.
 * @param {Element} el Field that contains the email address.
 * @return {boolean} Whether email is invalid.
 **/
function checkInvalidDomain(el){
  var invalidDomains = [
      'general-mail.com', 'bol.com', 'bo.com.br',
      '0hotmail.com', 'hotmail.com.br', 'hotmail.br',
      'lol.com', 'uol.com', 'mail.com',
      'gol.com', 'sol.com', '16.com', '13.com',
      'yaol.com', 'aol.com.br', 'hsn.com', 'man.com',
      'men.com', 'q.com', 'mymail.com', 'lol.com.br',
      'bo.com.br', 'boi.com.br', 'bol.cm.br', 'bol.co.br',
      'bol.com.be', 'bol.com.r', 'bol.combr', 'bola.com.br',
      'boll.com.br', 'box.com.br', 'nol.com.br', 'ol.com.br',
      'vol.com.br', '_gmail.com', 'g-mail.com',
      'g.mail.com', 'g_mail.com', 'gamail.com', 'gamil.com',
      'gemail.com', 'ggmail.com', 'gimail.com', 'gmai.com',
      'gmail.cim', 'gmail.co', 'gmaill.com', 'gmain.com',
      'gmaio.com', 'gmal.com', 'gmali.com', 'gmeil.com',
      'gmial.com', 'gmil.com', 'gtmail.com', 'igmail.com',
      'hotmail.co.uk', 'hotmail.com.uk', '0hotmail.com',
      '8hotmail.com', '_hotmail.com', 'ahotmail.com',
      'ghotmail.com', 'gotmail.com', 'hatmail.com', 'hhotmail.com',
      'ho0tmail.com', 'hogmail.com', 'hoimail.com', 'hoitmail.com',
      'homail.com', 'homtail.com', 'hootmail.com', 'hopmail.com',
      'hoptmail.com', 'hormail.com', 'hot.mail.com', 'hot_mail.com',
      'hotail.com', 'hotamail.com', 'hotamil.com', 'hotamil.com',
      'hotimail.com', 'hotlmail.com', 'hotmaail.com', 'hotmael.com',
      'hotmai.com', 'hotmaial.com', 'hotmaiil.com', 'hotmail.acom',
      'hotmail.bom', 'hotmail.ccom', 'hotmail.cm', 'hotmail.co',
      'hotmail.coml', 'hotmail.comm', 'hotmail.con', 'hotmail.coom',
      'hotmail.copm', 'hotmail.cpm', 'hotmail.lcom', 'hotmail.ocm',
      'hotmail.om', 'hotmail.xom', 'hotmail2.com', 'hotmail_.com',
      'hotmailc.com', 'hotmaill.com', 'hotmailo.com', 'hotmaio.com',
      'hotmaiol.com', 'hotmais.com', 'hotmal.com', 'hotmall.com',
      'hotmamil.com', 'hotmaol.com', 'hotmayl.com', 'hotmeil.com',
      'hotmial.com', 'hotmil.com', 'hotmmail.com', 'hotmnail.com',
      'hotmsil.com', 'hotnail.com', 'hotomail.com', 'hottmail.com',
      'hotymail.com', 'hoymail.com', 'hptmail.com', 'htmail.com',
      'htomail.com', 'ohotmail.com', 'otmail.com', 'rotmail.com',
      'shotmail.com', 'ieg.com.br', 'ig.com.brr', 'igb.com.br',
      'igp.com.br', 'pig.com.br', 'rg.com.br', 'reaiffmail.com',
      'redffmail.com', 'redifemail.com', 'rediff.mail.com',
      'rediffemail.com', 'rediffmai.com', 'rediffmaill.com',
      'redifmail.com', 'redoffmail.com', 'yaho.co.in', 'yahoo.co.cn',
      'yahoo.co.n', 'yahoo.co.on', 'yahoo.coin', 'yahoo.com.in',
      'yahoo.cos.in', 'yahoo.oc.in', 'yaoo.co.in', 'yhoo.co.in',
      '1yahoo.com.br', '5yahoo.com.br', '_yahoo.com.br', 'ayhoo.com.br',
      'tahoo.com.br', 'uahoo.com.br', 'yagoo.com.br', 'yahho.com.br',
      'yaho.com.br', 'yahoo.cm.br', 'yahoo.co.br', 'yahoo.com.ar',
      'yahoo.com.b', 'yahoo.com.be', 'yahoo.com.ber', 'yahoo.com.bl',
      'yahoo.com.brr', 'yahoo.com.brv', 'yahoo.com.bt', 'yahoo.com.nr',
      'yahoo.coml.br', 'yahoo.con.br', 'yahoo.om.br', 'yahool.com.br',
      'yahooo.com.br', 'yahoou.com.br', 'yaoo.com.br', 'yaroo.com.br',
      'yhaoo.com.br', 'yhoo.com.br', 'yuhoo.com.br', '_yahoo.com',
      'ahoo.com', 'ayhoo.com', 'eyahoo.com', 'hahoo.com', 'sahoo.com',
      'yahho.com', 'yaho.com', 'yahol.com', 'yahoo.co', 'yahoo.con',
      'yahoo.vom', 'yahoo0.com', 'yahoo1.com', 'yahool.com',
      'yahooo.com', 'yahoou.com', 'yahoow.com', 'yahopo.com',
      'yaloo.com', 'yaoo.com', 'yaroo.com', 'yayoo.com', 'yhaoo.com',
      'yhoo.com', 'yohoo.com', 'y7mail.com'];

  var error = false;
  var tempArr = el.value.split('@');
  el.setAttribute((document.All ? 'className' : 'class'), '');

  if (tempArr[1]) {
    error = isEmailInvalid(el);

    for(var i = 0; i < invalidDomains.length; i++) {
      if (tempArr[1] == invalidDomains[i]) {
        error = true;
      }
    }
  } else {
    error = true;
  }
  return error;
}

/**
 * Function to verify an email address is invalid.
 *
 * @param {node} field the field being tested
 * @param {string} domain the domain to be checked
 * @return {boolean} whether the email address causes an error
 **/
function isEmailInvalid(field) {
  var email_pattern = /^[^ \"\']+\@[^ \"\']+\.[^ \"\']+[^ \"\'.]$/;
  return !email_pattern.test(field.value);
}
