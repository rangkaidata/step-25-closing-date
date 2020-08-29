'use strict';
// step 23:
function IncomeStatement(){
	// step 23.1:
	var html;
	var sdate,edate;
	var url=global_url+'view/';
	var company_data;

	// step 23.2:
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

	// step 23.3:
	function formInput(sd,ed){
		modul.innerHTML="Income Statement";
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

	// step 23.4:	
	function previewData(){
		var ptype=document.getElementById('ptype').value;
		
		html='<button type="button" id="btn_back" onclick="objModul.formInput(\''+sdate.value+'\',\''+edate.value+'\');"></button>';
		btn.innerHTML =html;	
		metode.innerHTML='Preview Data';

		const obj = {
			"login_blok":login_blok,
			"ptype":ptype,
			"sdate":sdate.value,
			"edate":edate.value,
		};
		loadXHR(url+"income_statement.php",obj,previewShow);
		
		function previewShow(paket){
			var company_name=company_data.company_name;

			if (paket.err===0){
				var sum_debit=0,sum_credit=0;
				
				html='<p>Total: '+paket.count+' rows</p>'
					+'<p>File name: <a href="" id="downloadLink" onclick="exportF(this,\'income_statement\')">income_statement.xls</a></p>'
					+'<table border=1 id="exportTable">'
					+'<caption>'
					+'<h1>'+company_name.toUpperCase()+'</h1>'
					+'<h2>INCOME STATEMENT</h2>'
					+tglIna3(sdate.value)+' to ' +tglIna3(edate.value)
					+'</caption>';
										
				// sort array js
				paket.data.sort(function(a, b){return a.account_id - b.account_id});
				var saldo=0;
				var saldo_group=0;
				var saldo_income=0;
				var saldo_expense=0;
				var header_class;
				
				for (var x in paket.data) {
					
					if (x==0){
						header_class=paket.data[x].account_class;	
						html+='<tr><td style="text-align:left" colspan=5><h2>'+header_class.toUpperCase()+'</h2></td></tr>';
					}
					
					if (header_class!=paket.data[x].account_class){
						html+='<tr><td style="text-align:right" colspan=5><b>'+formatSerebuan(saldo_group)+'</b></td></tr>';
						saldo_group=0;
						
						html+='<tr><td style="text-align:left" colspan=5><h2>'+paket.data[x].account_class.toUpperCase()+'</h2></td></tr>';
					}
					
					header_class=paket.data[x].account_class;
					
					saldo+=parseFloat(paket.data[x].account_debit-paket.data[x].account_credit);
					saldo_income+=parseFloat(paket.data[x].account_credit);
					saldo_expense+=parseFloat(paket.data[x].account_debit);
					saldo_group+=parseFloat(paket.data[x].account_saldo);
					
					html+='<tr>'
						+'<td>'+paket.data[x].account_id+'</td>'
						+'<td>'+paket.data[x].account_name+'</td>'
						+'<td style="text-align:right">'+formatSerebuan(paket.data[x].account_debit)+'</td>'
						+'<td style="text-align:right">'+formatSerebuan(paket.data[x].account_credit)+'</td>'
						+'<td>&nbsp;</td>';
						+'</tr>';
						
					sum_debit+=parseFloat(paket.data[x].account_debit);
					sum_credit+=parseFloat(paket.data[x].account_credit);
					
				}
				html+='<tr><td style="text-align:right" colspan=5><b>'+formatSerebuan(saldo_group)+'</b></td></tr>';
				
				html+='<tr><td style="text-align:left" colspan=5><h2>PROFIT & LOST</h2></td></tr>'
					+'<tr>'
					+'<td style="text-align:right;" colspan=5><b>'+formatSerebuan(saldo*-1)+'</b></td>'
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
	
	
	/* */
	this.formInput=function(sd,ed){
		formInput(sd,ed);
	}
	
	this.previewData=function(){
		previewData();
	}

	// step 23.5:	
	init();
}
