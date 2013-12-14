  counter = 0;
  function ch(id){
    document.write('<span onclick="tooltipOnMouseover(\'tooltipImg_'+counter+'\', \'true\');');
    document.write('tooltipLoader.loadContentDelayed(\''+id+'&hl='+hc_lang+'\',\'tooltipDiv_'+counter+'\',\'tooltipSpan_'+counter+'\');"');
    document.write('class="" id="tooltipSpan_'+counter+'" onmouseout="tooltipOnMouseover(\'tooltipImg_'+counter+'\', \'false\');');
    document.write('tooltipLoader.hideContent(\'tooltipDiv_'+counter+'\');"');
    document.write('onmouseover="tooltipOnMouseover(\'tooltipImg_'+counter+'\', \'true\');tooltipLoader.loadContent(\'');
    document.write(id+'&hl='+hc_lang+'\',\'tooltipDiv_'+counter+'\',\'tooltipSpan_'+counter+'\');">');   
    document.write('<img src="https://www.google.com/accounts/hosted/helpcenter/images/tooltips/923093475-question_mark.gif"');
    document.write('style="vertical-align: middle; border: 0px none; margin-top: 2px; margin-right: 4px;"');
    document.write('title="" height="14" width="13" alt="Help" id="tooltipImg_'+counter+'"></span>');
    document.write('<div style="display:none;visibility:hidden;" onmouseout="tooltipOnMouseover(\'tooltipImg_'+counter+'\', \'false\');');
    document.write('tooltipLoader.hideContent(\'tooltipDiv_'+counter+'\');"'); 
    document.write('align="'+hc_langdir+'" id="tooltipDiv_'+counter);
    document.write('" onmouseover="tooltipOnMouseover(\'tooltipImg_'+counter+'\', \'true\');');
    document.write('tooltipLoader.loadContent(\''+id+'&hl='+hc_lang+'\',\'tooltipDiv_'+counter+'\',\'tooltipSpan_'+counter+'\');"');
    document.write('class="tooltipPopup"></div>');

    counter++;
  }





