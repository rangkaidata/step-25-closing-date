'use strict';
// step 21: 
function BalanceSheet(){
	// step 21.1: 
	var html;
	var url=global_url+'view/';
	var account_kelas;
	var account_name;
	var company_data;

	// step 21.2: 
	function init(){
		const obj={
			"login_blok":login_blok
		}
		
		loadXHR(global_url+'company/read_open.php',obj,companyProf);
		
		function companyProf(paket){
			company_data=paket.data[0];
			formInput();
		}
	}

	// step 21.3: 	
	function formInput(sd,ed){
		modul.innerHTML="Balance Sheet";
		metode.innerHTML="View Data";
		btn.innerHTML='<button onclick="objModul.previewData()">Preview</button>';
		msg.innerHTML='';
		html='<ul>'
			+'<li><label>Posting</label> : '
			+'<select id="ptype">'
			+'<option value="opening">Opening Only</option>'
			+'<option value="general">Opening+General</option>'
			+'<option value="adjusting">Opening+General+Adjusting</option>'
			+'<option value="closing" selected>Opening+General+Adjusting+Closing</option>'
			+'</select>'
			+'</li>'

			+'<li><label>Dated From</label> : <input type="date" id="sdate"></li>'
			+'<li><label>to</label> : <input type="date" id="edate"></li>'
			+'</ul>';
			
		app.innerHTML=html;

		sdate=document.getElementById('sdate');
		edate=document.getElementById('edate');
		var company_sdate=company_data.company_sdate;

		if (sd===undefined){sdate.value=company_sdate;}else{sdate.value=sd;}
		if (ed===undefined){edate.value=tglSekarang();}else{edate.value=ed;}
	}

	// step 21.4:
	function previewData(){
		var ptype=document.getElementById('ptype').value
		var company_name=company_data.company_name;
		html='<button type="button" id="btn_back" onclick="objModul.formInput(\''+sdate.value+'\',\''+edate.value+'\');"></button>';
		btn.innerHTML =html;	
		metode.innerHTML='Preview Data';

		const obj = {
			"login_blok":login_blok,
			"ptype":ptype,
			"sdate":sdate.value,
			"edate":edate.value,
		};
		loadXHR(url+"balance_sheet.php",obj,previewShow); 			

		function previewShow(paket){
			if (paket.err===0){
				var sum_debit=0,sum_credit=0;
				
				html='<p>Total: '+paket.count+' rows</p>'
					+'<p>File name: <a href="" id="downloadLink" onclick="exportF(this,\'balance_sheet\')">balance_sheet.xls</a></p>'
					+'<table border=1 id="exportTable">'
					+'<caption>'
					+'<h1>'+company_name.toUpperCase()+'</h1>'
					+'<h2>BALANCE SHEET</h2>'
					+''+tglIna3(sdate.value)+' to ' +tglIna3(edate.value)+''
					+'</caption>';										
				// sort array js
				paket.data.sort(function(a, b){return a.account_id - b.account_id});
				
				var class_group;
				var saldo_group=0;
				var saldo=0;
				var kana=0,kiri=0;
				var saldo_kiri=0,saldo_kana=0;
				var total_kiri=0,total_kana=0;
				
				for (var x in paket.data) {
					if (x==0){
						class_group=paket.data[x].account_class;						
						html+='<tr>'
							+'<td colspan=5 style="text-align:left;"><h2>'+class_group+'</h2></td>'
							+'</tr>';
					}
					
					if (class_group!=paket.data[x].account_class){
						if (class_group=='Asset'){
							total_kiri=saldo_group;
							total_kana=0;
						}else{
							total_kiri=0
							total_kana=saldo_group;
						}

						html+='<tr>'
							+'<td colspan=2 style="text-align:right;">&nbsp;</td>'
							+'<td style="text-align:right"><h3>'+formatSerebuan(total_kiri)+'</h3></td>'
							+'<td style="text-align:right"><h3>'+formatSerebuan(total_kana*-1)+'</h3></td>'
							+'</tr>'
							+'<tr>'
							+'<td colspan=5 style="text-align:left;"><h1>'+paket.data[x].account_class+'</h1></td>'
							+'</tr>';
						saldo_group=0;
					}
					class_group=paket.data[x].account_class;

					if (class_group=='Asset'){
						saldo_kiri+=parseFloat(paket.data[x].account_saldo);
						kiri=parseFloat(paket.data[x].account_saldo);
						kana=0
					}else{
						saldo_kana+=parseFloat(paket.data[x].account_saldo);
						kana=parseFloat(paket.data[x].account_saldo);
						kiri=0
					}
					
					html+='<tr>'
						+'<td>'+paket.data[x].account_id+'</td>'
						+'<td>'+paket.data[x].account_name+'</td>'
						+'<td style="text-align:right">'+formatSerebuan(kiri)+'</td>'
						+'<td style="text-align:right">'+formatSerebuan(kana*-1)+'</td>'
						+'<td>&nbsp;</td>';
						+'</tr>';
					
					saldo_group+=parseFloat(paket.data[x].account_saldo);
					saldo+=parseFloat(paket.data[x].account_saldo);
				}
				html+='<tr>'
					+'<td colspan=2 style="text-align:right;">&nbsp;</td>'
					+'<td>&nbsp;</td>'
					+'<td style="text-align:right"><h3>'+formatSerebuan(saldo_group*-1)+'</h3></td>'
					+'</tr>';
				
				html+='<tr><td>&nbsp;</td><td style="text-align:center;font-weight:bold;">Balance</td>'
					+'<td style="text-align:right;font-weight:bold;">'+formatSerebuan(saldo_kiri)+'</td>'
					+'<td style="text-align:right;font-weight:bold;">'+formatSerebuan(saldo_kana*-1)+'</td>'
					+'<td style="text-align:right;font-weight:bold;">'+formatSerebuan(saldo)+'</td>'
					+'</tr>'
				html+='</table>';
				app.innerHTML=html;	
			}
			else{
				msg.innerHTML = paket.msg;	
				app.innerHTML='';	
			}
		}

	}

	// step 21.5:
	init();

	/* --- --- */
	this.formInput=function(sd,ed){
		formInput(sd,ed);
	}
	
	this.previewData=function(){
		previewData();
	}
	

	
}
