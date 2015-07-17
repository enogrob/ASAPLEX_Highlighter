// ==UserScript==
// @name Arrowed MHweb Highlighter by XSHP (Pavel Shpak)
// @namespace mhweb_xshp
// @description MHweb scripts by XSHP (Pavel Shpak). Arrowed MHweb Highlighter, Linked Correction identifier and so on...
// @include https://mhweb.ericsson.se/mhweb/servlet/servletCorrView?corrid=*
// @version 19
// @downloadURL http://www.ericpol.extern.sw.ericsson.se/xshp/mhweb_highlighter.xshp.user.js
// @updateURL http://www.ericpol.extern.sw.ericsson.se/xshp/mhweb_highlighter.xshp.user.js
// ==/UserScript==

/*
*  NOTE: This is Ericpol Internal Tool
*
*  Author: Pavel Shpak, IOOO Ericpol Brest
*  Maintenance: Marcin Pawlowski, Ericpol
*  E-mail: Marcin.Pawlowski@ericpol.com
*
*  Inspired by Dzmitry Nikalayuk.
*  Thanks to Przemyslaw Marczynski and Pawel Baczynski for lot of remarks and ideas.
*
*
*  History:
*  v1   MHweb Highlighter. ASA with arrowed jumps. 2012
*  v2   Hotfix of "jump arrows" bugs (thanks Alexander Dontsov for good correction example)
*  v3   Fixed some bugs (thanks Przemyslaw Marczynski) and done some corrections
*  v4   Added new ASA color-set "gorgeous" (requested by Przemyslaw Marczynski and others). New feature: set preferences up as defaults. 2012.05.02
*  v5   Fixed PLEX bug. Small changes of color-sets. Changed ASA menu. New feature: switching off/on ASA formatting to copy pure ASA. 2012.05.09
*  v6   Corrected ASA arrows style to be printed well. Corrected ASA formatting to be more general.
*       Added formatting for TEST SYSTEM. Changed switching off/on ASA and PLEX formatting.
*       Changed jump arrows select: now arrow is selected when mouse over/out and click on whole code line with jump label. 2012.05.18
*  v7   Added formatting for LASAL and other commands. Fixed problem with links. 2012.06.22
*  v8   Fixes for minor problems with POCRI/LAVCS/LAVCR formatting. Changed metadata: @downloadURL and @updateURL. 2012.12.03
*  v9   Linked Correction identifier in chapters: Trouble Effect, SII, Notebook. (Ref.: "5/000 21-3/FEA 202 635 Uen").
*       Linked Block Name in Status Data chapter for deskcheck Product Number and Revision.
*       Covered several missed ASA jump commands.
*       Added Error message. 2013.01.18
*  v10  Added Linked Correction identifier in chapter Trouble Description and Test Instruction.
*       Minor errors fixed. Optimization. Refactoring. Small Test Instruction highlighter.
*       Linked Email Address in Notebook chapter. Select ASA/PLEx (for easier copy/paste to file).
*       Jump line highlighting. Added emptiness check before ASA highlighting. 2013.01.28
*  v11  Used general regex to catch Emails. Added Linked Email Address in chapter Test Data and Cover Page.
*       PCORI/S toggle style. Refactoring. Minor fixes for ASA highlighting. Check if MHweb found the correction.
*       Added "case insensitive" modifier to regexes (ASA can be written in downcase too). 2013.02.22
*  v12  Adapted to be stored on Ericpol server. Added Ericpol info. 2013.03.01
*  v13  Adapted to be stored on Ericoll server. Added new correction type to be linked asked by DM team. 2013.03.07
*  v14  Embedded Ericpol logo. 2013.03.18
*  v15  RECEIVE keyword added to Plex highlighting. 2013.06.10
*  v16  ENTRANCE and TRANSFER keywords added to Plex highlighting. 2013.08.08
*  v17  Corrections of type R1ATCABZ-xxxx are not converted to hyperlinks. Issue by Przemyslaw Marczynski. Corrected. 2013.08.28
*  v18 Added links to Ericoll in Heading. Issue by Przemyslaw Marczynski. 2013.11.29
*  v19 Added links to Ericoll in SII. 2013.12.02
*/





/*******************************************************************************
*  DEFINITIONS                                                                 *
*******************************************************************************/
var main_style = ".main_style_matcher {}\
#span_asa_style_menu, #ericpol_info {padding: 0px 4px; border: 2px solid #0A0; color: #EEE; background: #060;}\
#ericpol_info {display: block; text-align: center; font-weight: bold; font-size: 12pt;}\
#span_asa_style_menu {display: none;}\
#plex_table pre, #asa_table pre  {margin: 0px;}\
.add_asa_div_left {text-align: right;}\
.correction_identifier, .status_data_block_name, .email_address {display: none;}\
.email_address_wrong {color: #F00; font-weight: bold;}\
";

var test_instruction_style = ".test_instruction_style_matcher {}\
.test_instruction_action, .test_instruction_result, .test_instruction_comment, .test_instruction_executed,\
 .test_instruction_fault_code, .test_instruction_not_accepted {font-weight: bold;}\
.test_instruction_action {color: #11B;}\
.test_instruction_result {color: #920;}\
.test_instruction_comment {color: #D73;}\
.test_instruction_executed {color: #1B0;}\
.test_instruction_fault_code, .test_instruction_not_accepted {color: #E00;}\
";

var jump_colors_style = "\
.color_L0 {color: #F00;}\
.color_L1 {color: #00F;}\
.color_L2 {color: #800;}\
.color_L3 {color: #008;}\
.color_L4 {color: #080;}\
.color_L5 {color: #F80;}\
.color_L6 {color: #FF0;}\
.color_L7 {color: #F0F;}\
.color_L8 {color: #0FF;}\
.color_L9 {color: #880;}\
.color_L10 {color: #808;}\
.color_L11 {color: #088;}\
.color_L12 {color: #0F0;}\
.color_L13 {color: #80F;}\
.color_L14 {color: #0F8;}\
.color_L15 {color: #000;}\
";

var asa_arrows_style = ".asa_arrows_style_matcher {}\
.add_asa_div {display: none;}\
";

var plex_style = ".plex_style_matcher {}\
.plex_old {background: #f88;}\
.plex_new {background: #bfb;}\
.plex_not_changed {background: #F6F6F6; color: #666666;}\
.plex_comment {font-style: italic; color: #008000;}\
.plex_head {font-style: solid; color: #F7F21A; background: #888888;}\
.plex_keyword {font-style: solid; color: #0068A7; font-weight: bold;}\
.plex_number {font-style: solid; color: #3C0AE6;}\
";

var asa_style_none = ".asa_style_matcher {}\
";

var asa_style_ascetic = ".asa_style_matcher {}\
.asa_block {border: 1px solid #888; padding: 6px;}\
.add_asa_div_left, .add_asa_div {padding: 7px 0px;}\
.asa_block, .add_asa_div_left pre, .add_asa_div pre {background: #F4F4F4;}\
.asa_pcorl {background: #FCC; display: block;}\
.asa_jump_to, .asa_jump_from, .asa_jump_address, .asa_bits, .asa_ep_command,\
 .asa_pcorl_block, .asa_pcorl_address, .asa_pcssl_signal, .asa_pcssl_ssp, .asa_pcsdl_lsn, .asa_pcori_after_amp,\
 .asa_lasal_format, .asa_lasal_intwk, .asa_lasal_mult, .asa_lasal_type, .asa_lasal_jb, .asa_lasal_buf, .asa_lasal_bulk,\
 .asa_lavcs_vcat, .asa_lavcs_var, .asa_lavcs_after_amps, .asa_pcori_after_amp_even, .asa_pcori_param\
 {font-weight: bold;}\
.asa_pcorl_block, .asa_pcorl_address, .asa_pcssl_signal, .asa_pcssl_ssp, .asa_pcsdl_lsn, .asa_pcori_after_amp,\
 .asa_lasal_format, .asa_lasal_intwk, .asa_lasal_mult, .asa_lasal_type, .asa_lasal_jb, .asa_lasal_buf, .asa_lasal_bulk,\
 .asa_lavcs_vcat, .asa_lavcs_var, .asa_lavcs_after_amps\
 {color: #04F;}\
.asa_pcori_after_amp_even {color: #F40;}\
.asa_pcori_param {color: #F06;}\
.asa_jump_to, .asa_jump_from, .asa_jump_address {color: #F00;}\
.asa_bits {color: #00C;}\
.asa_comment {color: #666;}\
";

var asa_style_rich = "\
.asa_signals, .asa_jumps, .asa_readstore, .asa_writestore, .asa_readcb, .asa_writecb,\
 .asa_loadconst, .asa_movereg, .asa_reg_arithmetic, .asa_ds_arithmetic, .asa_shiftlogic\
 {color: #06A;}\
.asa_wr_register, .asa_dr_register, .asa_ar_register,\
 .asa_pr_register, .asa_ir_register, .asa_cr_register\
 {color: #A06;}\
.asa_test_system_print {color: #b060cd;}\
.asa_test_system_set {color: #aa0000;}\
.asa_code_line {font-weight: bold;}\
";

var asa_style_gorgeous = "\
.asa_signals {color: #00ddff;}\
.asa_jumps {color: #ff8c19;}\
.asa_readstore {color: #4db53b;}\
.asa_writestore {color: #aa0000;}\
.asa_readcb {color: #53cb31;}\
.asa_writecb {color: #ff3333;}\
.asa_loadconst {color: #1360b3;}\
.asa_movereg {color: #00636a;}\
.asa_reg_arithmetic {color: #9a2323;}\
.asa_ds_arithmetic {color: #eb3535;}\
.asa_shiftlogic {color: #7d6092;}\
.asa_wr_register {color: #744200;}\
.asa_dr_register {color: #288600;}\
.asa_ar_register {color: #822500;}\
.asa_pr_register {color: #00a68a;}\
.asa_ir_register {color: #b060cd;}\
.asa_cr_register {color: #d97536;}\
.asa_test_system_print {color: #b060cd;}\
.asa_test_system_set {color: #aa0000;}\
.asa_code_line {font-weight: bold;}\
";





/**************************************************************************
 *  GENERAL FUNCTIONS                                                     *
 *************************************************************************/
function fnDeSelect() {
  if (document.selection) { document.selection.empty(); }
  else if (window.getSelection) { window.getSelection().removeAllRanges(); }
}

function fnSelect(objId) {
  fnDeSelect();
  if (document.selection) {
    var range = document.body.createTextRange();
    range.moveToElementText(document.getElementById(objId));
    range.select();
  }
  else if (window.getSelection) {
    var range = document.createRange();
    range.selectNode(document.getElementById(objId));
    window.getSelection().addRange(range);
  }
}





/**************************************************************************
 *  PLEX HIGHLIGHT                                                        *
 *************************************************************************/
function replacerComments(str, pos, text) {
  return "<span class=\"plex_comment\">" + str + "</span>";
}

function parseLine(str) {
  var found = str.match(/(\s*\d+\.[OLD|NEW|DEL|\d]+\s*)([^\!]*)(\![^\!]*\!)*.*/i);
  var ar = new Array();
  if(found == null || found.length < 2) return ar;
  if(found.length != 4) alert("Length: "+found.length+"\n0: "+found[0]+"\n1: "+found[1]+"\n2: "+found[2]+"\n3: "+found[3]);
  var pos0 = -1; // end of line number
  var pos1 = -1; // start comment
  var pos2 = -1; // end comment
  if(found.length == 4)
  {
    pos0 = found[1].length;
    if(typeof(found[3]) !== 'undefined' && found[3] != null)
    {
      pos1 = str.indexOf(found[3]);
      pos2 = pos1+found[3].length;
    }
    else
    {
      if(str.split("!") === 3)
      {
        pos1 = str.indexOf(found[2]);
        pos2 = pos1+str.indexOf(found[2].length)-1;
      }
    }
    ar[0] = str.substring(0,pos0);         // line number
    if(pos1 == -1 || pos2 == -1)
    {
      // not found comments
      ar[1] = str.substring(pos0);       // plex
      ar[2] = "";
      ar[3] = "";
    }
    else
    {
      ar[1] = str.substring(pos0,pos1); // plex
      ar[2] = str.substring(pos1,pos2); // comments
      ar[3] = str.substring(pos2);      // ignored part after comment
    }
  }
  return ar;
}

function diffHighlight(str) {
  var ar = parseLine(str);
  if(ar.length > 0)
  {
    ar[1]=ar[1].replace(/(^|[^\w\#]|\s)([0-9]+|\#[0-9A-F]+)($|[\s]|[^\w])/gi,"$1<span class=\"plex_number\">$2</span>$3");
    ar[1]=ar[1].replace(/(^|[^\w]|\s)(EXIT|FORMAT|ENTER|INSERT|WRITE|ABRANCH|POINTER|CODE|ID|RETURN|NSYMB|VARIABLE|GOTO|GO TO|IF|FI|THEN|ELSE|ELSIF|WITH|SEND|RETRIEVE|RECEIVE|ENTRANCE|TRANSFER|WAIT|FOR|IN|ON|NO|WHEN|ESAC|CASE|OTHERWISE|IS|DO|FROM|UPTO|DOWNTO|UNTIL)($|[^\w]|\s)/gi,"$1<span class=\"plex_keyword\">$2</span>$3");
    //ar[1]=ar[1].replace(/(^|[^\w]|\s)(IS|DO|FROM|UPTO|DOWNTO)($|[^\w]|\s)/gi,"$1<span class=\"plex_keyword\">$2</span>$3");
    str = ar[0]+ar[1]+ar[2]+ar[3];
  }
  str = str.replace(/\!.*\!/i,replacerComments);
  return str;
}

function PlexHighlightWithTable() {
  var PLEX = document.getElementById("pre_plex_copy").innerHTML;

  var PLEX_array = PLEX.split("\n");
  var PLEX_array_length = PLEX_array.length;
  var pattern_old = /^(\s*[0-9]{1,}\.(old|del).*)$/i;
  var pattern_new = /^(\s*[0-9]{1,}\.(new|\d+).*)$/i;
  var pattern_head = /^((ADD|REMOVE|REPLACE).*)$/;
  var pattern_non = /^(\s*(\d+\.([^NOD\d].*|)|(\.|:)+\s*))$/i;
  var tr_class;
  var element;

  for(var i=0; i<PLEX_array_length; i++){
    tr_class = "";
    element = PLEX_array[i];
    if (pattern_old.test(element))     { tr_class = "plex_old";
                                         element = diffHighlight(element); }
    else if(pattern_new.test(element)) { tr_class = "plex_new";
                                         element = diffHighlight(element); }
    else if(pattern_head.test(element)){ tr_class = "plex_head"; }
    else if(pattern_non.test(element)) { tr_class = "plex_not_changed"; }
    else if (element === "")           { element = "<br/>"; }
    PLEX_array[i] = "<tr class=\"" + tr_class + "\"><td><pre>" + element + "</pre></td></tr>";
  }

  PLEX = "<table id=\"plex_table\" cellpadding=0 cellspacing=0>" + PLEX_array.join("") + "</table>";
  document.getElementById("pre_plex_copy").innerHTML = PLEX;
}

/**************************************************************************
 *  PLEX HIGHLIGHT - EVENTS                                               *
 *************************************************************************/
function PlexFormattingDisplay(copy, original) {
  document.getElementById("pre_plex_copy").style.display = copy;
  document.getElementById("pre_plex_original").style.display = original;
}

function PlexStyleSwitch() {
  var button_name = document.getElementById("button_plex_style_switch").innerHTML;
  if (button_name === "Switch OFF PLEX Formatting and Select PLEX") {
    PlexFormattingDisplay("none", "");
    fnSelect("pre_plex_original");
    button_name = "Switch ON PLEX Formatting";
  }
  else {
    PlexFormattingDisplay("", "none");
    button_name = "Switch OFF PLEX Formatting and Select PLEX";
  }
  document.getElementById("button_plex_style_switch").innerHTML = button_name;
}





/**************************************************************************
 *  ASA HIGHLIGHT                                                         *
 *************************************************************************/
function AsaHighlight() {
  var ASA = document.getElementById("pre_asa_copy").innerHTML;

  ASA = ASA.replace(/^(\s+)/mg,"");  // delete spaces at the beginning of lines and delete empty lines
  ASA = ASA.replace(/(\s+)$/mg,"");  // delete spaces at the end of lines just to make them shorter

  // wrap ASA into table with one row
  ASA = "<table id=\"asa_table\" cellpadding=0 cellspacing=0><tr><td class=\"add_asa_div_left\"></td><td class=\"asa_block\"><pre>" + ASA + "</pre></td><td class=\"add_asa_div\"></td></tr></table>";
  // format each not formated yet PCORL to table cell, part 1
  ASA = ASA.replace(/(\n)(PCORL)/ig,"</pre></td><td class=\"add_asa_div\"></td></tr><tr><td></td><td></br></td><td></td></tr><tr><td class=\"add_asa_div_left\"></td><td class=\"asa_block\"><pre>$2");
  // format code from first PCORI to new table cell
  ASA = ASA.replace(/(\n)(PCORI)/i,"</pre></td><td class=\"add_asa_div\"></td></tr><tr><td></td><td></br></td><td></td></tr><tr><td class=\"add_asa_div_left\"></td><td class=\"asa_block\"><pre>$2");
  // format code from first PCORS to new table cell
  ASA = ASA.replace(/(\n)(PCORS)/i,"</pre></td><td class=\"add_asa_div\"></td></tr><tr><td></td><td></br></td><td></td></tr><tr><td class=\"add_asa_div_left\"></td><td class=\"asa_block\"><pre>$2");
  // format each not formated yet PCORL to table cell, part 2
  ASA = ASA.replace(/(END;)(\n)/ig,"$1</pre></td><td class=\"add_asa_div\"></td></tr><tr><td></td><td></br></td><td></td></tr><tr><td class=\"add_asa_div_left\"></td><td class=\"asa_block\"><pre>");

  // jumps. Uppercase is done to have the same format for "to" and "from" jumps used in "ArrowedJump" function
  ASA = ASA.replace(/^(L\d{1,2})/img, function(match, p1) { return "<span class=\"asa_jump_to\">" + p1.toUpperCase() + "</span>"; });
  ASA = ASA.replace(/^(J[^!\n]+|ADDR\s+)(L\d{1,2})/img, function(match, p1, p2) { return p1 + "<span class=\"asa_jump_from\">" + p2.toUpperCase() + "</span>"; });
  ASA = ASA.replace(/^((XLLR|FESR|FCZS|BLO|BLOD) [^!\n]+)(L\d{1,2})/img, function(match, p1, p2, p3) { return p1 + "<span class=\"asa_jump_from\">" + p3.toUpperCase() + "</span>"; });
  ASA = ASA.replace(/^(J[^!\n]+|ADDR\s+)((H'|#)[\dA-F]{1,4})(\s*;)/img,"$1<span class=\"asa_jump_address\">$2</span>$4");
  ASA = ASA.replace(/^((XLLR|FESR|FCZS|BLO|BLOD) [^!\n]+)((H'|#)[\dA-F]{1,4})(\s*;)/img,"$1<span class=\"asa_jump_address\">$3</span>$5");

  ASA = ASA.replace(/(!([^<\n]|<[^\/\n])*)/mg,"<span class=\"asa_comment\">$1</span>");

  ASA = ASA.replace(/^([^!\n]+\/\s*)([BTCHWD]\d{1,2})(.*;)/img,"$1<span class=\"asa_bits\">$2</span>$3");

  // ASA = ASA.replace(/^(SRT|RCP|ADDR|XRBN|XRST)(\s+)/img,"<span class=\"asa_some_other_commands\">$1</span>$2");
  ASA = ASA.replace(/^(EP)(\s*;)/img,"<span class=\"asa_ep_command\">$1</span>$2")

  ASA = ASA.replace(/^(SSN|SSIN|SSPD|SSL|SSIL|SSPL|SSPB|SSPBD|SSB|SSBD|SSIB|SSIBD|SCBS|XSTQ|XSTQD|SSRP|SSRPE|RCBS)(\s+)/img,"<span class=\"asa_signals\">$1</span>$2");
  ASA = ASA.replace(/^(JLN|JLL|JOR|JZR|JEC|JUC|JER|JUR|JGT|JLT|JTR|JTS)(\s+)/img,"<span class=\"asa_jumps\">$1</span>$2");
  ASA = ASA.replace(/^(RS|RSE|RSI|RSIU|RSIL|RSII|RSS|RSA|RSL|RSU|RDP|RDB|RDBI)(\s+)/img,"<span class=\"asa_readstore\">$1</span>$2");
  ASA = ASA.replace(/^(WS|WSE|WSI|WSII|WSIU|WSIL|WSS|WSA|WSL|WSU|WHC|WHCL|WHCU|WZ|WZL|WO|WDB|WDBI|FIRSI)(\s+)/img,"<span class=\"asa_writestore\">$1</span>$2");
  ASA = ASA.replace(/^(RCB)(\s+)/img,"<span class=\"asa_readcb\">$1</span>$2");
  ASA = ASA.replace(/^(WCB)(\s+)/img,"<span class=\"asa_writecb\">$1</span>$2");
  ASA = ASA.replace(/^(LHC|LHCE|LCC|LWCD)(\s+)/img,"<span class=\"asa_loadconst\">$1</span>$2");
  ASA = ASA.replace(/^(MFR|MFRE|MTR)(\s+)/img,"<span class=\"asa_movereg\">$1</span>$2");
  ASA = ASA.replace(/^(AR|ARD|ACC|AWC|AWCD|SR|SRD|SCC|SWC|SWCD|MR|DR)(\s+)/img,"<span class=\"asa_reg_arithmetic\">$1</span>$2");
  ASA = ASA.replace(/^(AHCS|AHCSL|SHCS|SHCSL)(\s+)/img,"<span class=\"asa_ds_arithmetic\">$1</span>$2");
  ASA = ASA.replace(/^(SHL|SHLD|SHR|SHRD|ROL|ROLD|ROR|RORD|ER|OR|NR|NWC|NHC)(\s+)/img,"<span class=\"asa_shiftlogic\">$1</span>$2");

  ASA = ASA.replace(/(WR\d{1,2})/img,"<span class=\"asa_wr_register\">$1</span>");
  ASA = ASA.replace(/(DR\d{1,2})/img,"<span class=\"asa_dr_register\">$1</span>");
  ASA = ASA.replace(/(AR\d{1,2})/img,"<span class=\"asa_ar_register\">$1</span>");
  ASA = ASA.replace(/(PR\d)/img,"<span class=\"asa_pr_register\">$1</span>");

  ASA = ASA.replace(/<pre>PCORL(.+\n)+END;/ig, function(match) {
    match = match.replace(/^([^!\n]+)(IR)/img,"$1<span class=\"asa_ir_register\">$2</span>");
    match = match.replace(/^([^!\n]+)(CR)/img,"$1<span class=\"asa_cr_register\">$2</span>");
    match = match.replace(/^(([^<]|<[^p])[^;!]+;)/img,"<span class=\"asa_code_line\">$1</span>");
    match = match.replace(/^(<span class="asa_code_line)("><span class="asa_jump_to">)(L\d{1,2})(<\/span>[^;!]+;<\/span>)/img,"$1 asa_jump_to_line_$3$2$3$4");
    return match.replace(/^(<span class="asa_code_line)(">[^;!]+<span class="asa_jump_from">)(L\d{1,2})(<\/span>\s*;<\/span>)/img,"$1 asa_jump_from_line_$3$2$3$4");
  });

  ASA = ASA.replace(/(PCORL:.+\n)/ig,"<span class=\"asa_pcorl\">$1</span>");
  ASA = ASA.replace(/((PCOR[LIS]|PCS[SD]L|LAVC[SR]):[^;]*BLOCK=)([^,;]+)/ig,"$1<span class=\"asa_pcorl_block\">$3</span>");
  ASA = ASA.replace(/((PCOR[LIS]|PCSDL):[^;]*(&amp;[^;]*)*I[SA]=)([^,;&]+)/ig,"$1<span class=\"asa_pcorl_address\">$4</span>");
  ASA = ASA.replace(/((PCOR[IS]|PCS[SD]L|LASAL):[^;]*(&amp;[^;]*)*SIGNAL=)([^,;&]+)/ig,"$1<span class=\"asa_pcssl_signal\">$4</span>");
  ASA = ASA.replace(/((PCOR[IS]|PCSSL):[^;]*(&amp;[^;]*)*SSP=)([^,;&]+)/ig,"$1<span class=\"asa_pcssl_ssp\">$4</span>");
  ASA = ASA.replace(/(PCSDL:[^;]*LSN=)([^,;]+)/ig,"$1<span class=\"asa_pcsdl_lsn\">$2</span>");
  ASA = ASA.replace(/(LASAL:[^;]*FORMAT=)([^,;]+)/ig,"$1<span class=\"asa_lasal_format\">$2</span>");
  ASA = ASA.replace(/(LASAL:[^;]*INTWK=)([^,;]+)/ig,"$1<span class=\"asa_lasal_intwk\">$2</span>");
  ASA = ASA.replace(/(LASAL:[^;]*MULT=)([^,;]+)/ig,"$1<span class=\"asa_lasal_mult\">$2</span>");
  ASA = ASA.replace(/(LASAL:[^;]*TYPE=)([^,;]+)/ig,"$1<span class=\"asa_lasal_type\">$2</span>");
  ASA = ASA.replace(/(LASAL:[^;]*JB=)([^,;]+)/ig,"$1<span class=\"asa_lasal_jb\">$2</span>");
  ASA = ASA.replace(/(LASAL:[^;]*BUF=)([^,;]+)/ig,"$1<span class=\"asa_lasal_buf\">$2</span>");
  ASA = ASA.replace(/(LASAL:[^;]*BULK=)([^,;]+)/ig,"$1<span class=\"asa_lasal_bulk\">$2</span>");
  ASA = ASA.replace(/(LAVC[SR]:[^;]*(&amp;[^;]*)*VAR=)([^,;&]+)/ig,"$1<span class=\"asa_lavcs_var\">$3</span>");
  ASA = ASA.replace(/(LAVC[SR]:[^;]*(&amp;[^;]*)*VCAT=)([^,;&]+)/ig,"$1<span class=\"asa_lavcs_vcat\">$3</span>");

  // LAVCS/R "addition" values
  ASA = ASA.replace(/LAVC[SR]:[^;]+(&amp;(&amp;|)[^&;]+)+;/ig, function(match) {
    return match.replace(/(&amp;)([^,;&]+)/ig,"$1<span class=\"asa_lavcs_after_amps\">$2</span>");
  });

  // TEST SYSTEM
  ASA = ASA.replace(/[\n|>]TEST\s+SYSTEM;.*(\n.+)+\nEND\s+TEST;/ig, function(match) {
    match = match.replace(/^(PRINT|SET)(\s+VAR\s+)(\w+)/img,"$1$2<span class=\"asa_pcorl_block\">$3</span>");
    match = match.replace(/^(PRINT)([^;!]+;)/img,"<span class=\"asa_code_line\"><span class=\"asa_test_system_print\">$1</span>$2</span>");
    return match.replace(/^(SET)([^;!]+;)/img,"<span class=\"asa_code_line\"><span class=\"asa_test_system_set\">$1</span>$2</span>");
  });

  // PCORI/S parameters and "addition" values
  ASA = ASA.replace(/PCOR[IS]:[^:]+(<\/pre|$)/img, function(match) {
    match = match.replace(/(&amp;)([^,]+(,|$))/ig, function(match) {
      var toggled_collor = "";
      return match.replace(/(&amp;)([^,;&]+)/ig, function(match, p1, p2) {
        toggled_collor = ( toggled_collor === "" ) ? "_even" : "";
        return p1 + "<span class=\"asa_pcori_after_amp" + toggled_collor + "\">" + p2 + "</span>";
      });
    });
    return match.replace(/((IA|SSP|SIGNAL)=)/ig, "<span class=\"asa_pcori_param\">$1</span>")
  });

  document.getElementById("pre_asa_copy").innerHTML = ASA;
}

/**************************************************************************
 *  ASA HIGHLIGHT - EVENTS                                                *
 *************************************************************************/
function ChangeStyleContent(matcher, new_style) {
  var head_style_nodes = document.getElementsByTagName("head")[0].getElementsByTagName("style");
  var head_style_nodes_length = head_style_nodes.length;
  for (var j=0; j<head_style_nodes_length; j++) {
    if (head_style_nodes[j].innerHTML.match(matcher)) {
      head_style_nodes[j].innerHTML = new_style;
    }
  }    
}

function AsaHighlightSelect() {
  var style_string = asa_style_none;
  var selected_index = document.getElementById("asa_color_set").selectedIndex;
  if (selected_index === 1) { style_string = asa_style_ascetic; }
  if (selected_index === 2) { style_string = asa_style_ascetic + asa_style_rich; }
  if (selected_index === 3) { style_string = asa_style_ascetic + asa_style_gorgeous; }
  ChangeStyleContent( /^\.asa_style_matcher/g, style_string );
}





/**************************************************************************
 *  ASA JUMP ARROWS                                                       *
 *************************************************************************/
function ArrowedJump(asa_jump_arrow_spaces) {

  var ASA_rows = document.getElementById("asa_table").getElementsByTagName("tr");
  var ASA_rows_length = ASA_rows.length;

  var pattern_asa_jump_to = /(asa_jump_to\">)(L\d+)/ig;
  var pattern_asa_jump_from = /(asa_jump_from\">)(L\d+)/i;

  var ASA_td = "";
  var ASA_td_strigns = [];
  var ASA_td_strigns_length = 0;
  var ASA_td_arrows;
  var ASA_td_arrows_left;

  var space = " ";
  var minus = "\u2500"; // "-"
  var wall = "\u2502";  // "|"

  var top_right = "\u2510";
  var bottom_right = "\u2518";
  var middle_right = "\u2524";
  var arrow = "<";

  var top_left = "\u250C";
  var bottom_left = "\u2514";
  var middle_left = "\u251C";
  var arrow_left = ">";

  var matches_to;
  var amount_of_jumps_to;

  for (var i=0; i<ASA_rows_length; i++) {
    ASA_td = ASA_rows[i].getElementsByTagName("td")[1].innerHTML;
    matches_to = ASA_td.match(pattern_asa_jump_to);
    amount_of_jumps_to = matches_to===null?0:matches_to.length;
    if (amount_of_jumps_to>0) {
      ASA_td_arrows = [];
      ASA_td_arrows_left = [];
      ASA_td_strigns = ASA_td.split("\n");
      ASA_td_strigns_length = ASA_td_strigns.length;
      matches_to.sort();
      matches_to.sort(function(a,b){return a.length - b.length});
      var matches_from = [];
      for (var im=0; im<amount_of_jumps_to; im++) {
        matches_from[im] = matches_to[im].replace(/to/,"from");
      }
      // will be used for path
      var array_to = [];
      var array_from = [];
      for (var im=0; im<amount_of_jumps_to; im++) {
        array_from[im] = new Array();
      }

      // jumps
      var arrow_string;
      var arrow_string_left;
      for (var ist=0; ist<ASA_td_strigns_length; ist++) {
        arrow_string = "";
        arrow_string_left = "";
        // jump to
        if (pattern_asa_jump_to.test(ASA_td_strigns[ist])) {
          for (var im=0; im<amount_of_jumps_to; im++) {
            if (matches_to[im]===ASA_td_strigns[ist].match(pattern_asa_jump_to)[0]) {
              array_to[im] = ist;  // will be used for path
              arrow_string = arrow;
              arrow_string_left = arrow_left;
              var minus_count = (im+1)*asa_jump_arrow_spaces-1;
              var space_count = amount_of_jumps_to*asa_jump_arrow_spaces - minus_count - 1;
              for (var c=0; c<minus_count-1; c++) { arrow_string += minus; arrow_string_left = minus + arrow_string_left; }
              arrow_string += wall;
              arrow_string_left = wall + arrow_string_left;
              for (var c=0; c<space_count; c++) { arrow_string += space; arrow_string_left = space + arrow_string_left; }
            }
          }
        }
        // jump from
        else if (pattern_asa_jump_from.test(ASA_td_strigns[ist])) {
          for (var im=0; im<amount_of_jumps_to; im++) {
            if (matches_from[im]===ASA_td_strigns[ist].match(pattern_asa_jump_from)[0]) {
              array_from[im].push(ist);  // will be used for path
              var minus_count = (im+1)*asa_jump_arrow_spaces-1;
              var space_count = amount_of_jumps_to*asa_jump_arrow_spaces - minus_count - 1;
              for (var c=0; c<minus_count; c++) { arrow_string += minus; arrow_string_left = minus + arrow_string_left; }
              arrow_string += wall;
              arrow_string_left = wall + arrow_string_left;
              for (var c=0; c<space_count; c++) { arrow_string += space; arrow_string_left = space + arrow_string_left; }
            }
          }
        }
        // empty string
        else {
          var space_count = amount_of_jumps_to*asa_jump_arrow_spaces;
          for (var c=0; c<space_count; c++) { arrow_string += space; arrow_string_left += space; }
        }
        ASA_td_arrows[ist] = arrow_string;
        ASA_td_arrows_left[ist] = arrow_string_left;
      }

      // path through empty strings
      var first_string;
      var last_string;
      var lengt_from_im;
      var position;
      var color_number;
      var wall_sign;
      for (var im=amount_of_jumps_to-1; im>=0; im--) {
        array_from[im].sort(function(a,b){return a - b});
        lengt_from_im = array_from[im].length;
        first_string = 0;
        last_string = 0;
        position = (im+1)*asa_jump_arrow_spaces-1;
        if (array_from[im][lengt_from_im-1] < array_to[im]) {
          first_string = array_from[im][0];
          last_string = array_to[im];
        }
        else {
          last_string = array_from[im][lengt_from_im-1];
          if (array_from[im][0] < array_to[im]) { first_string = array_from[im][0]; }
          else { first_string = array_to[im]; }
        }
        color_number = matches_to[im].match(/\d+/);
        for (var ist=first_string+1; ist<last_string; ist++) {
          // middle jump from
          wall_sign = wall;
          if (array_to[im] === ist) { wall_sign = middle_right; }
          else {
            for (var inim=0; inim<lengt_from_im; inim++) {
              if (array_from[im][inim] === ist) { wall_sign = middle_right; }
            }
          }
          ASA_td_arrows[ist] = ASA_td_arrows[ist].substring(0,position) + "<span class=\"color_L" + color_number + "\">" + wall_sign + "</span>" + ASA_td_arrows[ist].substring(position+1);
        }
        // change corners
        ASA_td_arrows[first_string] = ASA_td_arrows[first_string].substring(0,position) + top_right + ASA_td_arrows[first_string].substring(position+1);
        ASA_td_arrows[last_string] = ASA_td_arrows[last_string].substring(0,position) + bottom_right + ASA_td_arrows[last_string].substring(position+1);
      }
      for (var im=0; im<amount_of_jumps_to; im++) {
        lengt_from_im = array_from[im].length;
        first_string = 0;
        last_string = 0;
        position = (im+1)*asa_jump_arrow_spaces-1;
        position = amount_of_jumps_to*asa_jump_arrow_spaces - position - 1;
        if (array_from[im][lengt_from_im-1] < array_to[im]) {
          first_string = array_from[im][0];
          last_string = array_to[im];
        }
        else {
          last_string = array_from[im][lengt_from_im-1];
          if (array_from[im][0] < array_to[im]) { first_string = array_from[im][0]; }
          else { first_string = array_to[im]; }
        }
        color_number = matches_to[im].match(/\d+/);
        for (var ist=first_string+1; ist<last_string; ist++) {
          // middle jump from
          wall_sign = wall;
          if (array_to[im] === ist) { wall_sign = middle_left; }
          else {
            for (var inim=0; inim<lengt_from_im; inim++) {
              if (array_from[im][inim] === ist) { wall_sign = middle_left; }
            }
          }
          ASA_td_arrows_left[ist] = ASA_td_arrows_left[ist].substring(0,position) + "<span class=\"color_L" + color_number + "\">" + wall_sign + "</span>" + ASA_td_arrows_left[ist].substring(position+1);
        }
        // change corners
        ASA_td_arrows_left[first_string] = ASA_td_arrows_left[first_string].substring(0,position) + top_left + ASA_td_arrows_left[first_string].substring(position+1);
        ASA_td_arrows_left[last_string] = ASA_td_arrows_left[last_string].substring(0,position) + bottom_left + ASA_td_arrows_left[last_string].substring(position+1);
      }

      // colors for jump to and jump from
      for (var im=0; im<amount_of_jumps_to; im++) {
        color_number = matches_to[im].match(/\d+/);
        ASA_td_arrows[array_to[im]] = ASA_td_arrows[array_to[im]].replace(/([<\u2500]\u2500+(\u2510|\u2518|))/ig,"<span class=\"color_L" + color_number + "\">$1</span>");
        ASA_td_arrows_left[array_to[im]] = ASA_td_arrows_left[array_to[im]].replace(/((\u250C|\u2514|)\u2500+[\u2500>])/ig,"<span class=\"color_L" + color_number + "\">$1</span>");
        lengt_from_im = array_from[im].length;
        for (var inim=0; inim<lengt_from_im; inim++) {
          ASA_td_arrows[array_from[im][inim]] = ASA_td_arrows[array_from[im][inim]].replace(/(\u2500{2,}(\u2510|\u2518|))/ig,"<span class=\"color_L" + color_number + "\">$1</span>");
          ASA_td_arrows_left[array_from[im][inim]] = ASA_td_arrows_left[array_from[im][inim]].replace(/((\u250C|\u2514|)\u2500{2,})/ig,"<span class=\"color_L" + color_number + "\">$1</span>");
        }
      }

      ASA_rows[i].getElementsByTagName("td")[0].innerHTML = "<pre>" + ASA_td_arrows_left.join("\n") + "</pre>";
      ASA_rows[i].getElementsByTagName("td")[2].innerHTML = "<pre>" + ASA_td_arrows.join("\n") + "</pre>";
    }
  }
}





/**************************************************************************
 *  ASA JUMP ARROWS - HELP FUNCTIONS                                      *
 *************************************************************************/
function RestoreOrRemoveJumpArrowEvents(restore) {
  var spans = document.getElementById("asa_table").getElementsByTagName("span");
  var spans_length = spans.length;
  var span_i;
  for (var i=0; i<spans_length; i++) {
    span_i = spans[i];
    if (span_i.className.match(/asa_jump_(to|from)_line/g)) {
      if (restore) {
        span_i.addEventListener("mouseover", AsaSpanMouseOverHandlerParent, false);
        span_i.addEventListener("mouseout", ArrowedJumpMenuEvent, false);
      }
      else {
        span_i.removeEventListener("mouseover", AsaSpanMouseOverHandlerParent, false);
        span_i.removeEventListener("mouseout", ArrowedJumpMenuEvent, false);
      }
    }
  }
}

function ArrowedJumpDelete() {
  var ASA_rows = document.getElementById("asa_table").getElementsByTagName("tr");
  var ASA_rows_length = ASA_rows.length;
  var ASA_rows_cells = [];
  for (var i=0; i<ASA_rows_length; i++) {
    ASA_rows[i].firstChild.innerHTML = "";
    ASA_rows[i].lastChild.innerHTML = "";
  }
}

function AsaJumpArrowSpacesChose() {
  var asa_jump_arrow_spaces = document.getElementById("asa_jump_arrow_spaces").value;
  asa_jump_arrow_spaces = asa_jump_arrow_spaces.replace(/[^\d]/,"3");
  if (asa_jump_arrow_spaces<3) { asa_jump_arrow_spaces = 3; }
  document.getElementById("asa_jump_arrow_spaces").value = asa_jump_arrow_spaces;
  return asa_jump_arrow_spaces;
}





/**************************************************************************
 *  ASA JUMP ARROWS - EVENTS                                              *
 *************************************************************************/
function TakeLabel(span) {
  if (span.className.match(/asa_jump_(to|from)_line/g)) { return span.lastChild.previousSibling.innerHTML; }
  else { return span.parentNode.lastChild.previousSibling.innerHTML; }
}
function AsaSpanClickHandlerParent(event) { ArrowedJumpClick( TakeLabel(event.target) ); }
function AsaSpanMouseOverHandlerParent(event) { ArrowedJumpMouseOver( TakeLabel(event.target) ); }
var ArrowedJumpClickString = "";

function ArrowedJumpMenuEvent() {
  var selected_index = document.getElementById("asa_jump_arrow").selectedIndex;
  var sides_display = ".asa_arrows_style_matcher {}";
  if (selected_index === 0) {
    sides_display += ".add_asa_div_left, .add_asa_div {display:none;}";
    ChangeStyleContent( /^\.asa_arrows_style_matcher/g, sides_display );
    if (ArrowedJumpClickString === "") { RestoreOrRemoveJumpArrowEvents(false); }
    else { ArrowedJumpClickString = "no_arrow"; }
  }
  else {
    ArrowedJumpClickString = "";
    var selected_side = document.getElementById("asa_arrow_side").selectedIndex;
    if (selected_side === 0) { sides_display += ".add_asa_div {display:none;}"; }
    if (selected_side === 1) { sides_display += ".add_asa_div_left {display:none;}"; }
    ChangeStyleContent( /^\.asa_arrows_style_matcher/g, sides_display + (selected_index===2?jump_colors_style:"") );
    RestoreOrRemoveJumpArrowEvents(true);
  }
}

function ArrowedJumpSpacesEvent() {
  ArrowedJumpDelete();
  ArrowedJump(AsaJumpArrowSpacesChose());
  ArrowedJumpMenuEvent();
}

function BuildSelectedArrowStyle(label) {
  return ".color_" + label + " {color: #F00; background: #FFA;}.asa_jump_from_line_"
                   + label + " {background: #FF8; border: 2px solid #AA0;}.asa_jump_to_line_"
                   + label + " {background: #8F8; border: 2px solid #0A0;}";
}

function ArrowedJumpClick(jump_label) {
  if (ArrowedJumpClickString === jump_label) {
    var selected_index = document.getElementById("asa_jump_arrow").selectedIndex;
    if (selected_index !== 0) { RestoreOrRemoveJumpArrowEvents(true); ArrowedJumpClickString = ""; }
    else { ArrowedJumpMenuEvent(); }
  }
  else {
    if (ArrowedJumpClickString !== "no_arrow") { RestoreOrRemoveJumpArrowEvents(false); }
    ArrowedJumpClickString = jump_label;
    var selected_side = document.getElementById("asa_arrow_side").selectedIndex;
    var sides_display = ".asa_arrows_style_matcher {}";
    if (selected_side === 0) { sides_display += ".add_asa_div {display:none;}"; }
    if (selected_side === 1) { sides_display += ".add_asa_div_left {display:none;}"; }
    ChangeStyleContent( /^\.asa_arrows_style_matcher/g, sides_display + BuildSelectedArrowStyle(jump_label) );
  }
}

function ArrowedJumpMouseOver(jump_label) {
  var selected_side = document.getElementById("asa_arrow_side").selectedIndex;
  var sides_display = ".asa_arrows_style_matcher {}";
  if (selected_side === 0) { sides_display += ".add_asa_div {display:none;}"; }
  if (selected_side === 1) { sides_display += ".add_asa_div_left {display:none;}"; }
  ChangeStyleContent( /^\.asa_arrows_style_matcher/g, sides_display + BuildSelectedArrowStyle(jump_label) );
}





/**************************************************************************
 *  ASA DEFAULTS AND FORMATTING - HELP FUNCTIONS                          *
 *************************************************************************/
function AsaStyleDisplay(span, button) {
  document.getElementById("span_asa_style_menu").style.display = span;
  document.getElementById("button_asa_style_change").style.display = button;
}

function AsaFormattingDisplay(copy, original) {
  document.getElementById("pre_asa_copy").style.display = copy;
  document.getElementById("pre_asa_original").style.display = original;
}

/**************************************************************************
 *  ASA DEFAULTS AND FORMATTING                                           *
 *************************************************************************/
function AsaStyleUserChoiceDefaults() {
  GM_setValue("asa_style_user_choice",document.getElementById("asa_color_set").selectedIndex);
  GM_setValue("asa_arrow_style_user_choice",document.getElementById("asa_jump_arrow").selectedIndex);
  GM_setValue("asa_arrow_side_user_choice",document.getElementById("asa_arrow_side").selectedIndex);
  GM_setValue("asa_arrow_spaces_user_choice",AsaJumpArrowSpacesChose());
  AsaStyleDisplay("none", "inline");
}

function AsaStyleChange() {
  AsaStyleDisplay("inline", "none");
}

function AsaStyleSwitch() {
  var button_name = document.getElementById("button_asa_style_switch").innerHTML;
  if (button_name === "Switch OFF ASA Formatting and Select ASA") {
    AsaFormattingDisplay("none", "");
    AsaStyleDisplay("none", "inline");
    document.getElementById("button_asa_style_change").disabled = true;
    fnSelect("pre_asa_original");
    button_name = "Switch ON ASA Formatting";
  }
  else {
    AsaFormattingDisplay("", "none");
    document.getElementById("button_asa_style_change").disabled = false;
    button_name = "Switch OFF ASA Formatting and Select ASA";
  }
  document.getElementById("button_asa_style_switch").innerHTML = button_name;
}





/**************************************************************************
 *  PLEX AND ASA PREPARATION                                              *
 *************************************************************************/
function PreparationForPlexAndAsaHighlighting() {

  var pre_PLEX_original_node = document.getElementsByTagName('pre')[0];
  var pre_ASA_original_node = document.getElementsByTagName('pre')[1];

  // PLEX preparations
  var temp_menu = pre_PLEX_original_node.previousSibling.innerHTML;
temp_menu = temp_menu.replace(/(<a name=\"chapter7\">&nbsp;PLEX Solution<\/a>)/i,"$1\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\
<button id=\"button_plex_style_switch\" style=\"width:350px;\">Switch OFF PLEX Formatting and Select PLEX</button>\
");
  pre_PLEX_original_node.previousSibling.innerHTML = temp_menu;

  document.getElementById("button_plex_style_switch").addEventListener("click", PlexStyleSwitch, false);
  var pre_PLEX_copy_node = pre_PLEX_original_node.cloneNode(true);
  pre_PLEX_original_node.id = "pre_plex_original";
  pre_PLEX_copy_node.id = "pre_plex_copy";
  document.body.insertBefore(pre_PLEX_copy_node,pre_PLEX_original_node);
  pre_PLEX_original_node.style.display = "none";

  PlexHighlightWithTable();

  // ASA preparations
  if (pre_ASA_original_node.innerHTML.replace(/^\s+$/g, "") !== "") {

    temp_menu = pre_ASA_original_node.previousSibling.innerHTML;
temp_menu = temp_menu.replace(/(<a name=\"chapter8\">&nbsp;ASA Solution<\/a>)/i,"$1\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\
<button id=\"button_asa_style_switch\" style=\"width:350px;\">Switch OFF ASA Formatting and Select ASA</button>\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\
<button id=\"button_asa_style_change\">Change ASA Style</button>\
<span id=\"span_asa_style_menu\">\
Color-set:\
<select id=\"asa_color_set\"><option>none</option><option selected=\"selected\">ascetic</option><option>rich</option><option>gorgeous</option></select>\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\
Arrows:\
<select id=\"asa_jump_arrow\"><option>none</option><option selected=\"selected\">black</option><option>colorized</option></select>\
&nbsp;&nbsp;&nbsp;\
Side:\
<select id=\"asa_arrow_side\"><option selected=\"selected\">left</option><option>right</option><option>both</option></select>\
&nbsp;&nbsp;&nbsp;\
Spaces:\
<input id=\"asa_jump_arrow_spaces\" type=\"text\" value=\"3\" maxlength=\"1\" size=\"1\" style=\"width:30px; text-align:center;\" />\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\
<button id=\"button_asa_style_user_choice\">Make it defaults</button>\
</span>\
");
    pre_ASA_original_node.previousSibling.innerHTML = temp_menu;

    document.getElementById("button_asa_style_switch").addEventListener("click", AsaStyleSwitch, false);
    document.getElementById("button_asa_style_change").addEventListener("click", AsaStyleChange, false);
    document.getElementById("asa_color_set").addEventListener("change", AsaHighlightSelect, false);
    document.getElementById("asa_jump_arrow").addEventListener("change", ArrowedJumpMenuEvent, false);
    document.getElementById("asa_arrow_side").addEventListener("change", ArrowedJumpMenuEvent, false);
    document.getElementById("asa_jump_arrow_spaces").addEventListener("change", ArrowedJumpSpacesEvent, false);
    document.getElementById("button_asa_style_user_choice").addEventListener("click", AsaStyleUserChoiceDefaults, false);
    var pre_ASA_copy_node = pre_ASA_original_node.cloneNode(true);
    pre_ASA_original_node.id = "pre_asa_original";
    pre_ASA_copy_node.id = "pre_asa_copy";
    document.body.insertBefore(pre_ASA_copy_node,pre_ASA_original_node);
    pre_ASA_original_node.style.display = "none";

    AsaHighlight();

    var spans = document.getElementById("asa_table").getElementsByTagName("span");
    var spans_length = spans.length;
    var span_i;
    for (var i=0; i<spans_length; i++) {
      span_i = spans[i];
      if (span_i.className.match(/asa_jump_(to|from)_line/g)) {
        span_i.addEventListener("click", AsaSpanClickHandlerParent, false);
        span_i.addEventListener("mouseover", AsaSpanMouseOverHandlerParent, false);
        span_i.addEventListener("mouseout", ArrowedJumpMenuEvent, false);
      }
    }

    var asa_arrow_spaces_user_choice = GM_getValue("asa_arrow_spaces_user_choice");
    if (asa_arrow_spaces_user_choice !== undefined) {
      document.getElementById("asa_jump_arrow_spaces").value = asa_arrow_spaces_user_choice;
      document.getElementById("asa_color_set").selectedIndex = GM_getValue("asa_style_user_choice");
      document.getElementById("asa_jump_arrow").selectedIndex = GM_getValue("asa_arrow_style_user_choice");
      document.getElementById("asa_arrow_side").selectedIndex = GM_getValue("asa_arrow_side_user_choice");
      AsaHighlightSelect();
      ArrowedJumpMenuEvent();
    }
    else { AsaStyleUserChoiceDefaults(); }
    ArrowedJump(AsaJumpArrowSpacesChose());

  }

}





/**************************************************************************
 *  MODIFICATIONS IN OTHER CHAPTERS                                       *
 *************************************************************************/
function EmailAddressToLink(content) {
  var replace_template = "<span class=\"email_address\">$1</span><a href=\"mailto:$1\">$1</a>";
  return content.replace(/\b([_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4}))\b/ig, replace_template);
}

function ChangeCorrectionToLink(content) {
  var replace_template = "<span class=\"correction_identifier\">$1</span><a href=\"https://mhweb.ericsson.se/mhweb/servlet/servletCorrView?corrid=$1\" target=\"_blank\">$1</a>";
  // according "5/000 21-3/FEA 202 635 Uen"
  content = content.replace(/(\b[EMP]C-[A-Z]{2}\d{5}\b)/ig, replace_template); // EC, MC, PC corrections
  content = content.replace(/(\b[ABCDEFGHJMNPRZKX]0[12]([TM]C[A-Z]|)[A-Z]{2}-\d{4}\b)/ig, replace_template); // TC, AMC, PAC corrections
  content = content.replace(/(\b[FGHJMNPR][NBW][A-Z]{3}-\d{4}(M\d{4}|)\b)/ig, replace_template); // SPAC, MAC corrections

  content = content.replace(/(\bR1ATCACY-\d{4}\b)/ig, replace_template); // addition for DM team
  content = content.replace(/(\bR1ATCABZ-\d{4}\b)/ig, replace_template); // addition for DM team
  return content.replace(/(href="[^"]*)(%0A)(")/ig,"$1$3"); // solution for existed corrupted links;
}

function ChangeWSMDToLink(content) {
content = content.replace(/(\s*WSMD-)(\d)(\d)(\d)(\d)(\d)(\s*)/ig, "<span class=\"status_data_block_name\">$1$2$3$4$5$6$7</span><a href=\"" + "https://ericoll2.internal.ericsson.com/sites/" +"mde-dcne-market-development/prjdir/Documents/"+
 "Forms/viewStandard.aspx"+ "?RootFolder=%2fsites%2fmde%2ddcne%2dmarket%2ddevelopment"+ "%2fprjdir%2fDocuments%2fExecution%5fProjects%2fWSMD" + "$2$3$400-$2$3$499/WSMD-$2$3$4$5$6"  + "&SortField=LinkFilename&SortDir=Asc" + "\" target=\"_blank\">$1$2$3$4$5$6</a>$7");
 content = content.replace(/(\s*WSMD-)(\d)(\d)(\d)(\d)(\D\s*)/ig, "<span class=\"status_data_block_name\">$1$2$3$4$5$6</span><a href=\"" + "https://ericoll2.internal.ericsson.com/sites/" +"mde-dcne-market-development/prjdir/Documents/"+
 "Forms/viewStandard.aspx"+ "?RootFolder=%2fsites%2fmde%2ddcne%2dmarket%2ddevelopment"+ "%2fprjdir%2fDocuments%2fExecution%5fProjects%2fWSMD" + "0$2$300-0$2$399/WSMD-$2$3$4$5"  + "&SortField=LinkFilename&SortDir=Asc" + "\" target=\"_blank\">$1$2$3$4$5</a>$6");
  content = content.replace(/(\s*WSMD-)(\d)(\d)(\d)(\D\s*)/ig, "<span class=\"status_data_block_name\">$1$2$3$4$5</span><a href=\"" + "https://ericoll2.internal.ericsson.com/sites/" +"mde-dcne-market-development/prjdir/Documents/"+
 "Forms/viewStandard.aspx"+ "?RootFolder=%2fsites%2fmde%2ddcne%2dmarket%2ddevelopment"+ "%2fprjdir%2fDocuments%2fExecution%5fProjects%2fWSMD" + "00$200-00$299/WSMD-0$2$3$4"  + "&SortField=LinkFilename&SortDir=Asc" + "\" target=\"_blank\">$1$2$3$4</a>$5");
   content = content.replace(/(\s*WSMD-)(\d)(\d)(\D\s*)/ig, "<span class=\"status_data_block_name\">$1$2$3$4</span><a href=\"" + "https://ericoll2.internal.ericsson.com/sites/" +"mde-dcne-market-development/prjdir/Documents/"+
 "Forms/viewStandard.aspx"+ "?RootFolder=%2fsites%2fmde%2ddcne%2dmarket%2ddevelopment"+ "%2fprjdir%2fDocuments%2fExecution%5fProjects%2fWSMD" + "00000-00099/WSMD-00$2$3"  + "&SortField=LinkFilename&SortDir=Asc" + "\" target=\"_blank\">$1$2$3</a>$4");
    content = content.replace(/(\s*WSMD-)(\d)(\D\s*)/ig, "<span class=\"status_data_block_name\">$1$2$3</span><a href=\"" + "https://ericoll2.internal.ericsson.com/sites/" +"mde-dcne-market-development/prjdir/Documents/"+
 "Forms/viewStandard.aspx"+ "?RootFolder=%2fsites%2fmde%2ddcne%2dmarket%2ddevelopment"+ "%2fprjdir%2fDocuments%2fExecution%5fProjects%2fWSMD" + "00000-00099/WSMD-000$2"  + "&SortField=LinkFilename&SortDir=Asc" + "\" target=\"_blank\">$1$2</a>$3");
return content;
}

function TestInstructionHighlighter(content) {
  content = content.replace(/(ACTION:)/ig,"<span class=\"test_instruction_action\">$1</span>");
  content = content.replace(/(RESULT:)/ig,"<span class=\"test_instruction_result\">$1</span>");
  content = content.replace(/(COMMENT:)/ig,"<span class=\"test_instruction_comment\">$1</span>");
  content = content.replace(/(EXECUTED)/ig,"<span class=\"test_instruction_executed\">$1</span>");
  content = content.replace(/(FAULT\s+CODE)/ig,"<span class=\"test_instruction_fault_code\">$1</span>");
  content = content.replace(/(NOT\s+ACCEPTED)/ig,"<span class=\"test_instruction_not_accepted\">$1</span>");
  return content;
}


function checkFormEricoll(wsmd)
{

wsmd = wsmd.replace(/\s/gi,"");
var linkstart = " https://ericoll2.internal.ericsson.com/sites/"+
               "mde-dcne-market-development/prjdir/Documents/"+
			   "Forms/viewStandard.aspx"+
			   "?RootFolder=%2fsites%2fmde%2ddcne%2dmarket%2ddevelopment"+
			   "%2fprjdir%2fDocuments%2fExecution%5fProjects%2fWSMD";

var a, b, c;
			  
var wsmdStart=(wsmd-wsmd%100);
var wsmdStop=wsmdStart+99
var leadingZeros=5-wsmd.toString().length;
if(leadingZeros < 0)return "";
if(leadingZeros > 4 )return "";
if(leadingZeros==0){a=wsmdStart.toString(); 
           b=wsmdStop.toString(); 
		   c=wsmd.toString();}
if(leadingZeros==1){a="0"+wsmdStart.toString(); 
           b="0"+wsmdStop.toString(); 
		   c=wsmd.toString();}
if(leadingZeros==2){a="00"+wsmdStart.toString(); 
           b="00"+wsmdStop.toString(); 
		   c="0"+wsmd.toString();}
if(leadingZeros==3){a="000"+wsmdStart.toString(); 
           b="000"+wsmdStop.toString(); 
		   c="00"+wsmd.toString();}
if(leadingZeros==4){a="0000"+wsmdStart.toString(); 
           b="000"+wsmdStop.toString(); 
		   c="000"+wsmd.toString();}
		   
		  linkstart = linkstart+a+"%2d"+b+"%2fWSMD%2d"+c
             +"&SortField=LinkFilename&SortDir=Asc";
	     return linkstart;
		   }

function LinkToEricoll(content) {

  if (content.match(/MDE\s*\d+\s*:/ig)) {
        var numb = content.replace(/MDE\s*(\d+)\s*:\s*\w+.*/ig,"$1");
		numb = numb.replace(/\s/gi,"");
		var linka = checkFormEricoll(numb);
		var tempdata1 = content.replace(/(MDE\s*\d+)\s*:\s*\w+.*/ig,"<span class=\"status_data_block_name\">$1</span><a href=\"");
		var tempdata2 = content.replace(/(MDE\s*\d+)(\s*:\s*\w+.*)/ig,"\" target=\"_blank\">$1</a>$2");
		content = tempdata1 + linka + tempdata2;
		return content;
     }
	 else
	 {
	 return content;
	 }
}


function OtherChaptersModifier() {
  // Status Data
  var checked_element = document.getElementsByName("chapter1")[0].parentNode.parentNode.parentNode.parentNode.nextSibling.nextSibling.nextSibling.nextSibling.getElementsByTagName("tr")[0].getElementsByTagName("td")[1];
  checked_element.innerHTML = LinkToEricoll(checked_element.innerHTML);
  
  var checked_element = document.getElementsByName("chapter1")[0].parentNode.parentNode.parentNode.parentNode.nextSibling.nextSibling.nextSibling.nextSibling.getElementsByTagName("tr")[8].getElementsByTagName("td")[1];
  checked_element.innerHTML = checked_element.innerHTML.replace(/([A-Z\d]+)/i,"<span class=\"status_data_block_name\">$1</span><a href=\"http://eed.ericsson.se/cgi-bin/blocknum.cgi?block=$1\" target=\"_blank\">$1</a>");
  // Trouble Effect
  checked_element = document.getElementsByName("chapter2")[0].parentNode.parentNode.parentNode.parentNode.nextSibling.nextSibling.nextSibling.nextSibling.getElementsByTagName("td")[0];
  checked_element.innerHTML = ChangeCorrectionToLink( checked_element.innerHTML );
  // Trouble Description
  checked_element = document.getElementsByName("chapter4")[0].parentNode.parentNode.parentNode.parentNode.nextSibling.nextSibling.nextSibling.nextSibling.getElementsByTagName("td")[0];
  checked_element.innerHTML = ChangeCorrectionToLink( checked_element.innerHTML );
  // SII
  checked_element = document.getElementsByName("chapter6")[0].parentNode.parentNode.parentNode.parentNode.parentNode.nextSibling.nextSibling.nextSibling.getElementsByTagName("td")[0];
  checked_element.innerHTML = ChangeCorrectionToLink( checked_element.innerHTML );
  checked_element.innerHTML = ChangeWSMDToLink( checked_element.innerHTML );
  // Test Data and Cover Page
  checked_element = document.getElementsByName("chapter9")[0].parentNode.parentNode.parentNode.parentNode.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling;
  checked_element.innerHTML = EmailAddressToLink( checked_element.innerHTML );
  // Notebook
  var checked_elements = document.getElementsByName("chapter11")[0].parentNode.parentNode.parentNode.parentNode.nextSibling.nextSibling.nextSibling.nextSibling.getElementsByTagName("td");
  checked_elements[1].innerHTML = ChangeCorrectionToLink( EmailAddressToLink( checked_elements[1].innerHTML ) ); // correction to link should be last
  checked_elements[3].innerHTML = ChangeCorrectionToLink( EmailAddressToLink( checked_elements[3].innerHTML ) ); // correction to link should be last
}

function TestInstructionModifier() {
  var checked_element = document.getElementsByName("chapter5")[0].parentNode.parentNode.parentNode.parentNode.nextSibling.nextSibling.nextSibling.nextSibling.getElementsByTagName("td")[0];
  checked_element.innerHTML = ChangeCorrectionToLink( TestInstructionHighlighter( checked_element.innerHTML ) ); // correction to link should be last
}

function ShowEricpolInfo() {
  var element = document.getElementsByName("chapter0")[0].parentNode;
  element.innerHTML += "<span id=\"ericpol_info\"><img alt=\"Ericpol Logo\" src=\"data:image/gif;base64,\
                        R0lGODlhEAAQAKU5AFuQEVyZFGudErt8CGqiG3ioGcWOCIetFnmyKRTJw76ZCLOiCYq6J0LF\
                        tLaxDorASJq/Jc2qC4TCUj3RysWxDHHGmJnFRnLOvJHKg8LFHqnLQ9jCFtDIGqHOfanOcpXP\
                        pXPZ093JK83UO5fWxNvRMNbWNq3VrZTe2N7VSt/WVtPbYt3aUbHbyL7art7bVNrcXNneVuHe\
                        auDfbt3heuDhd93ihODihuDjkeHjlv///////////////////////////yH5BAEKAD8ALAAA\
                        AgAQAAwAAAZQwJ9wSCwaj0XY7IY8gSaJ30pmwxlZo0tjmIrRasSW6VMpolwv1dDTwRhDpJJI\
                        qLE8JMcNJyOEMBBIERQOQgcFBEgGCgtDAgFIPwNEAJCVQkEAOw==\" />\
                        &nbsp;&nbsp;MHweb Highlighter is in use</span>";
}





/**************************************************************************
 *  MAIN FUNCTION                                                         *
 *************************************************************************/
(function main() {
  try{
    // check if MHweb found the correction
    if (document.getElementsByName("topform").length > 0) {
      document.getElementsByTagName("head")[0].innerHTML += "<style type=\"text/css\">" + main_style + "</style>"
                                                          + "<style type=\"text/css\">" + asa_arrows_style + "</style>"
                                                          + "<style type=\"text/css\">" + plex_style + "</style>"
                                                          + "<style type=\"text/css\">" + asa_style_ascetic + "</style>";
                                                          + "<style type=\"text/css\">" + test_instruction_style + "</style>";  
      ShowEricpolInfo();
      PreparationForPlexAndAsaHighlighting();
      OtherChaptersModifier();
      TestInstructionModifier();
    }
  } catch(error) {
    alert('Error: Arrowed MHweb Highlighter by XSHP (Pavel Shpak).\n\
Some part of this web page could be preformatted not correctly.\n\
\n\
It is possible that you have old version of script.\n\
Please load the last version of script using following link:\n\
http://www.ericpol.extern.sw.ericsson.se/xshp/mhweb_highlighter.xshp.user.js\n\
\n\
If you still have the error, please inform me about it:\n\
Marcin.Pawlowski@ericpol.com');
    throw error;
  }
})();