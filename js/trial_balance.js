'use strict';
// step 22: trial balance
function TrialBalance(){
	// step 22.1:
	var html;
	var url=global_url+'view/';
	var account_kelas;
	var account_name;
	var company_data;

	// step 22.2:
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

	// step 22.3:
	function formInput(sd,ed){
		modul.innerHTML="Trial Balance";
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
	
	// step 22.4:
	function previewData(){
		var company_name=company_data.company_name;
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
		loadXHR(url+"trial_balance.php",obj,previewShow); 			

		function previewShow(paket){
			if (paket.err===0){
				var sum_debit=0,sum_credit=0;
				
				html='<p>Total: '+paket.count+' rows</p>'
					+'<p>File name: <a href="" id="downloadLink" onclick="exportF(this,\'trial_balance\')">trial_balance.xls</a></p>'
					+'<table border=1 id="exportTable">'
					+'<caption>'
					+'<h1>'+company_name.toUpperCase()+'</h1>'
					+'<h2>TRIAL BALANCE</h2>'
					+tglIna3(sdate.value)+' to ' +tglIna3(edate.value)
					+'</caption>'
					+'<th>Account ID</th>'
					+'<th>Account Name</th>'
					+'<th>Debit</th>'
					+'<th>Credit</th>';
										
				// sort array js
				paket.data.sort(function(a, b){return a.account_id - b.account_id});
				
				for (var x in paket.data) {
					if (paket.data[x].account_saldo==0){
						
					}else{
						html+='<tr>'
							+'<td>'+paket.data[x].account_id+'</td>'
							+'<td>'+paket.data[x].account_name+'</td>'
							+'<td style="text-align:right">'+formatSerebuan(paket.data[x].account_debit)+'</td>'
							+'<td style="text-align:right">'+formatSerebuan(paket.data[x].account_credit)+'</td>'
							+'</tr>';
							
						sum_debit+=parseFloat(paket.data[x].account_debit);
						sum_credit+=parseFloat(paket.data[x].account_credit);
					}
				}
				
				html+='<tr><td>&nbsp;</td><td style="text-align:center;font-weight:bold;">Total</td>'
					+'<td style="text-align:right;font-weight:bold;">'+formatSerebuan(sum_debit)+'</td>'
					+'<td style="text-align:right;font-weight:bold;">'+formatSerebuan(sum_credit)+'</td>'
					+'</tr>'
				html+='</table>';
				app.innerHTML=html;	
			}
			else{
				message.innerHTML = paket.msg;	
				app.innerHTML='';	
			}
		}

	}
	
	/* --- --- */
	this.formInput=function(sd,ed){
		formInput(sd,ed);
	}
	
	this.previewData=function(){
		previewData();
	}

	// step 22.5:	
	init();
	
}
