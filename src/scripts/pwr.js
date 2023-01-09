 //var pwrst = 'https://sandbox.powercrm.com.br/';
 var pwrst = 'https://localhost:8443/';
//var pwrst = 'https://sandbox.powercrm.com.br/';
var able = true;

function loadScript(url, callback) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

loadScript(pwrst+'assets/external/js/jquery-3.1.0.min.js', function(){
  loadScript(pwrst+'assets/external/js/jquery.samask-masker.js', function(){
    loadScript('src/scripts/popper.min.js', function(){
      loadScript('src/scripts/bootstrap.min.js', function(){
        loadScript(pwrst+'assets/external/js/chosen.js', function(){
          // $('<link rel="stylesheet" href="'+pwrst+'assets/external/css/chosen.css" />').appendTo('body');
          loadPage();
        });
      });
    });
  });
});

var slsmnNwId = null;

var PowerCRM = PowerCRM || (function(){

    var pwrcrm = {};
    var cmpnHash;// Company hash
    return {
      init : function(Args, link) {
        cmpnHash = Args[0];
        try{if (slsmnNwId==null) slsmnNwId = localStorage.getItem('pwrid');}catch(e){}
        try{if (slsmnNwId==null || findGetParameter('id')!=null) slsmnNwId = findGetParameter('id');}catch(e){}
        try{if (slsmnNwId!=null) localStorage.setItem('pwrid',slsmnNwId);}catch(e){}

        $('.pwr_form').find("#pwr_field_mobile").mask('(00) 00000-0000');
        $('.pwr_form').find("#pwr_field_cpf").mask('000.000.000-00');
        
        // Validando o Nome
        $('.pwr_form').find("#pwr_field_name").keypress(function(){
          if($(this).val().length >= 2){
            $(this).addClass('input-true');
          }else{
            $(this).removeClass('input-true');
          }
        });

        // Validando o Telefone
        $('.pwr_form').find("#pwr_field_mobile").keypress(function(){
          if($(this).val().length >= 2){
            $(this).addClass('input-true');
          }else{
            $(this).removeClass('input-true');
          }
        });

        // Validando o e-mail
        $('.pwr_form').find("#pwr_field_email").keypress(function(){
          if(validateEmail($(this).val())){
            $(this).addClass('input-true');
          }else{
            $(this).removeClass('input-true');
          }
        });

        // Validando o cpf
        $('.pwr_form').find("#pwr_field_cpf").keypress(function(){
          if(validateCPF($(this).val())){
            $(this).addClass('input-true');
          }else{
            $(this).removeClass('input-true');
          }
        });

        $('.pwr_form').find('#pwr_step_1_next').unbind('click').click(function(){
          var obj = {
            h: cmpnHash,
            slsmnNwId: slsmnNwId,
            name: $(this).closest('.pwr_form').find('#pwr_field_name').val().trim(),
            email: $(this).closest('.pwr_form').find('#pwr_field_email').val().trim(),
            phone: $(this).closest('.pwr_form').find('#pwr_field_mobile').val().trim(),
            cpf: $(this).closest('.pwr_form').find('#pwr_field_cpf').val().trim()
          }
          if (obj.name.length>1) {
            if ((obj.email.length>0 && validateEmail(obj.email))) {
              if(obj.phone.length>0){
                if (validateCPF(obj.cpf)) {
                  var loadingPanel = $('<div style="position: fixed;top: 0; left:0;right:0;bottom:0;height:100%;width:100%;background: #ffffffde;z-index:999999999999999999;"><img src="https://resources.powercrm.com.br/assets/images/loading.gif" width="100" style="width:100px;margin:10% auto;display:block;"></div>').appendTo('body');
                  $.ajax({
                    type: 'POST',
                    url: pwrst + 'landingAffiliate',
                    data: JSON.stringify(obj),
                    cache: false,
                    headers: {'Content-Type': 'application/json'},
                    success: function (response) {
                      loadingPanel.remove();
                      if (response.id > 0) {
                        alert('Sucesso')
                      } else {
                        alert(response.text);
                      }
                    },
                    error: function (e) {
                      loadingPanel.remove();
                    }
                  });
                } else $(this).closest('.pwr_form').find('#pwr_field_cpf').attr('class', 'required');
              }else $(this).closest('.pwr_form').find('#pwr_field_mobile').attr('class', 'required');   
            } else $(this).closest('.pwr_form').find('#pwr_field_email').attr('class', 'required');   
          } else $(this).closest('.pwr_form').find('#pwr_field_name').attr('class', 'required');
        });

        $.ajax({type:'POST',url:pwrst+'getCompanyGlobalDataAffiliate',data:JSON.stringify({h: cmpnHash,slsmnNwId: slsmnNwId}),cache:false,headers: {'Content-Type': 'application/json'},
          success:function(response){
            $('.pwrImgLogo').attr('src',pwrst+'cmpnImg?h='+response.h);
            $('.cmpnFvIcn').attr('href',pwrst+'cmpnFvIcn?h='+response.h);
            $('.pwrImgLogo').show();
            $('.pwrBackColor').css('background-color',response.color);
            $('.pwrContentName').html(response.name);
            if (response.consultantId!=null) {
              $('.pwrConsultantExists').show();
              $('.pwrConsultantPhone').html(response.consultantPhone);
              if (response.consultantPhone.trim().indexOf("+55")!=0 && response.consultantPhone.trim().indexOf("55")!=0) response.consultantPhone = "55"+response.consultantPhone;
              $('.pwrConsultantExists').attr("href","https://api.whatsapp.com/send?phone="+response.consultantPhone.replace("(","").replace(")","").trim().replace(" ","").replace("-","")+"&text=OlÃ¡ "+response.consultantName+", quero fazer uma cotaÃ§Ã£o.");
              $('.pwrConsultantName').html(response.consultantName);
              $('.pwrConsultantEmail').html(response.consultantEmail);
              $('.pwrConsultantPicture').attr('src',pwrst+'slsmnPc?i='+response.consultantId);
            }
            else {
              $('.pwrConsultantPhone').html('');
              $('.pwrConsultantName').html('');
              $('.pwrConsultantEmail').html('');
              $('.pwrConsultantExists').hide();
            }
          },error:function(e) {}
        });
      }
    };
}());

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
}

function validateCPF(value){
  value = value.replace('.','');
  value = value.replace('.','');
  cpf = value.replace('-','');
  while(cpf.length < 11) cpf = "0"+ cpf;
  var expReg = /^0+$|^1+$|^2+$|^3+$|^4+$|^5+$|^6+$|^7+$|^8+$|^9+$/;
  var a = [];
  var b = new Number;
  var c = 11;
  for (i=0; i<11; i++){
   a[i] = cpf.charAt(i);
   if (i < 9) b += (a[i] * --c);
  }
  if ((x = b % 11) < 2) { a[9] = 0 } else { a[9] = 11-x }
  b = 0;
  c = 11;
  for (y=0; y<10; y++) b += (a[y] * c--);
  if ((x = b % 11) < 2) { a[10] = 0; } else { a[10] = 11-x; }
  if ((cpf.charAt(9) != a[9]) || (cpf.charAt(10) != a[10]) || cpf.match(expReg)) return false;
  return true;
}

function validateEmail(email) {
  var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
}