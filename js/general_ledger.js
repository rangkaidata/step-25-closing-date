
'use strict';
var posting_tipe;

// step 20: general ledger
function GeneralLedger(){
	// step 20.1:
	var html;
	var url=global_url+'view/';
	var company_data;
	var account_kelas;
	var account_data;

	// step 20.2:
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
	
	// step 20.3:
	function formInput(tipe,sd,ed){
		if (tipe==undefined){tipe='Type A';}
		var company_sdate=company_data.company_sdate;
		var func;
		
		/* --- --- */
		modul.innerHTML="General Ledger";
		metode.innerHTML="View Data";
		btn.innerHTML='<button onclick="objModul.previewDataByType(\''+tipe+'\');">Preview</button>';
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
			+'<li><label>View Type</label> : <select id="view_tipe" onchange="objModul.viewType(this.value,\''+sd+'\',\''+ed+'\');">'
			+'<option>Type A</option>'
			+'<option>Type B</option>'
			+'<option>Type C</option>'
			+'</select></li>'
			+'<li><label>Dated From</label> : <input type="date" id="sdate"></li>'
			+'<li><label>to</label> : <input type="date" id="edate"></li>';
			
			
		if (tipe=='Type B'){
			html+='<li><label>Account Class</label> :'
				+'<select id="account_class">'
				+'<option>Asset</option>'
				+'<option>Liability</option>'
				+'<option>Equity</option>'
				+'<option>Income</option>'
				+'<option>Cost of Sales</option>'
				+'<option>Expense</option>'
				+'<option>Other Income</option>'
				+'<option>Other Expense</option>'
				+'</select></li>'
				+'</li>';
		}
		if (tipe=='Type C'){
			html+='<li><label>Account ID</label> : <input type="text" id="account_id"><input type="text" id="account_blok" hidden=hidden>'
				+'<button id="btn_find" onclick="objModul.searchAccount();"></button></li>'
				+'<li><label>Account Name</label> : <span id="account_name">---</span></li>';
		}
		
		html+='</ul>';
			
		app.innerHTML=html;

		sdate=document.getElementById('sdate');
		edate=document.getElementById('edate');
		var view_tipe=document.getElementById('view_tipe');
		view_tipe.value=tipe;
		
		if (sd===undefined){sdate.value=company_sdate;}else{sdate.value=sd;}
		if (ed===undefined){edate.value=tglSekarang();}else{edate.value=ed;}

	}
	
	// step 20.4:
	function searchAccount(){
		objPop=new AccountLook('general_ledger','');
		objPop.readData();
	}
	
	// step 20.5:
	function selectAccount(data){
		document.getElementById('account_blok').value=data.account_blok;
		document.getElementById('account_id').value=data.account_id;
		document.getElementById('account_name').innerHTML=data.account_name;
	}
	
	// step 20.6:
	function viewType(tipe,sd,ed){
		formInput(tipe,sd,ed);
	}
	
	// step 20.7:
	function previewDataByType(tipe){
		posting_tipe=document.getElementById('ptype').value;
		
		html='<button type="button" id="btn_back" onclick="objModul.formInput(\''+tipe+'\',\''+sdate.value+'\',\''+edate.value+'\');"></button>';
		btn.innerHTML =html;	

		switch (tipe){
			case 'Type A':
				previewData();
				break;
			case 'Type B':
				var account_class=document.getElementById('account_class');
				previewDataB(account_class.value);
				break;
			case 'Type C':
				var account_blok=document.getElementById('account_blok').value;
				previewDataC(account_blok);
				break;
		}
	}
	
	// step 20.8:
	function previewData(){
		metode.innerHTML='Preview Data A';
		
		html='<button type="button" id="btn_back" onclick="objModul.formInput(\'Type A\',\''+sdate.value+'\',\''+edate.value+'\');"></button>';
		btn.innerHTML =html;	
		
		const obj = {
			"login_blok":login_blok,
			"ptype":posting_tipe,
			"sdate":sdate.value,
			"edate":edate.value,
		};
		loadXHR(url+"general_ledger.php",obj,previewShow); 			

		function previewShow(paket){
			if (paket.err===0){
				var sum_start=0;
				var sum_debit=0,sum_credit=0;
				var sum_end=0;
				var company_name=company_data.company_name;
				
				html='<p>Total: '+paket.count+' rows</p>'
					+'<p>File name: <a href="" id="downloadLink" onclick="exportF(this,\'general_ledger_type_a\')">general_ledger_type_a.xls</a></p>'
					+'<table border=1 id="exportTable">'
					+'<caption>'
					+'<h1>'+company_name.toUpperCase()+'</h1>'
					+'<h2>GENERAL LEDGER</h2>'
					+tglIna3(sdate.value)+' to ' +tglIna3(edate.value)
					+'</caption>'
					+'<th>Account Class</th>'
					+'<th>Begin</th>'
					+'<th>Debit</th>'
					+'<th>Credit</th>'
					+'<th>Saldo</th>'
					+'<th>Action</th>'
				
				var saldo=0;
				for (var x in paket.data) {
					saldo+=parseFloat(paket.data[x].account_end);
					html+='<tr>'
						+'<td>'+paket.data[x].account_class+'</td>'
						+'<td style="text-align:right">'+formatSerebuan(paket.data[x].account_start)+'</td>'
						+'<td style="text-align:right">'+formatSerebuan(paket.data[x].account_debit)+'</td>'
						+'<td style="text-align:right">'+formatSerebuan(paket.data[x].account_credit)+'</td>'
						+'<td style="text-align:right">'+formatSerebuan(paket.data[x].account_end)+'</td>'
						+'<td><button id="btn_detail" onclick="objModul.previewTipeB(\''+posting_tipe+'\',\''+paket.data[x].account_class+'\',\''+sdate.value+'\',\''+edate.value+'\')"></button></td>'
						+'</tr>';
						
					sum_start+=parseFloat(paket.data[x].account_start);
					sum_debit+=parseFloat(paket.data[x].account_debit);
					sum_credit+=parseFloat(paket.data[x].account_credit);
					sum_end+=parseFloat(paket.data[x].account_end);
				}
				
				html+='<tr>'
					+'<td style="text-align:right;font-weight:bold;" colspan=3>'+formatSerebuan(sum_debit)+'</td>'
					+'<td style="text-align:right;font-weight:bold;">'+formatSerebuan(sum_credit)+'</td>'
					+'<td style="text-align:right;font-weight:bold;">'+formatSerebuan(sum_end)+'</td>'
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
	
	// step 20.9:
	function previewTipeB(ptype,akun_kelas,sd,ed){
		var sdate=sd;
		var edate=ed;
		html='<button type="button" id="btn_back" onclick="objModul.previewData();"></button>';
		btn.innerHTML =html;	
		previewDataB(akun_kelas);
	}
	
	// step 20.10:
	function previewDataB(account_kelas){
		metode.innerHTML='Preview Data B';
		account_kelas=account_kelas;
		const obj = {
			"login_blok":login_blok,
			"ptype":posting_tipe,
			"sdate":sdate.value,
			"edate":edate.value,
			"account_class":account_kelas,
		};
		loadXHR(url+"general_ledger_b.php",obj,previewShow); 			

		function previewShow(paket){
			if (paket.err===0){
				var sum_start=0;
				var sum_debit=0,sum_credit=0;
				var sum_end=0;
				var company_name=company_data.company_name;
				html='<p>Total: '+paket.count+' rows</p>'
					+'<p>File name: <a href="" id="downloadLink" onclick="exportF(this,\'general_ledger_type_b\')">general_ledger_type_b.xls</a></p>'
					+'<table border=1 id="exportTable">'
					+'<caption>'
					+'<h1>'+company_name.toUpperCase()+'</h1>'
					+'<h2>GENERAL LEDGER</h2>'
					+'<h3>ACCOUNT CLASS '+account_kelas.toUpperCase()+'</h3>'
					+tglIna3(sdate.value)+' to ' +tglIna3(edate.value)
					+'</caption>'
					+'<th>Account ID</th>'
					+'<th>Account Name</th>'
					+'<th>Begin<br>('+tglIna(sdate.value)+')</th>'
					+'<th>Debit</th>'
					+'<th>Credit</th>'
					+'<th>Saldo</th>'
					+'<th>Action</th>'
									
				paket.data.sort(function(a, b){return a.account_id - b.account_id});	
				var saldo=0;
				for (var x in paket.data) {
					saldo+=parseFloat(paket.data[x].account_end);
					html+='<tr>'
						+'<td>'+paket.data[x].account_id+'</td>'
						+'<td>'+paket.data[x].account_name+'</td>'
						+'<td style="text-align:right">'+formatSerebuan(paket.data[x].account_start)+'</td>'
						+'<td style="text-align:right">'+formatSerebuan(paket.data[x].account_debit)+'</td>'
						+'<td style="text-align:right">'+formatSerebuan(paket.data[x].account_credit)+'</td>'
						+'<td style="text-align:right">'+formatSerebuan(paket.data[x].account_end)+'</td>'
						+'<td><button id="btn_detail" onclick="objModul.previewDataC(\''+paket.data[x].account_blok+'\')"></button></td>'
						+'</tr>';
						
					sum_start+=parseFloat(paket.data[x].account_start);
					sum_debit+=parseFloat(paket.data[x].account_debit);
					sum_credit+=parseFloat(paket.data[x].account_credit);
					sum_end+=parseFloat(paket.data[x].account_debit-paket.data[x].account_credit);
				}
				
				html+='<tr>'
					+'<td style="text-align:right;font-weight:bold;" colspan=3>'+formatSerebuan(sum_start)+'</td>'
					+'<td style="text-align:right;font-weight:bold;">'+formatSerebuan(sum_debit)+'</td>'
					+'<td style="text-align:right;font-weight:bold;">'+formatSerebuan(sum_credit)+'</td>'
					+'<td style="text-align:right;font-weight:bold;">'+formatSerebuan(sum_end)+'</td>'
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
	
	// step 20.11:
	function previewDataC(blok_id){
		const obj={
			"login_blok":login_blok,
			"account_blok":blok_id
		}
		
		loadXHR(global_url+'account/read_one.php',obj,readOne);
		
		function readOne(paket){
			if (paket.err==0){
				account_data=paket.data[0];
				previewDataCb(blok_id)
			}else{
				msg.innerHTML = paket.msg;	
				app.innerHTML='';	
			}
		}
	}
	
	// step 20.12:
	function previewDataCb(blok_id){
		metode.innerHTML='Preview Data C';

		const obj = {
			"login_blok":login_blok,
			"ptype":posting_tipe,
			"sdate":sdate.value,
			"edate":edate.value,
			"account_blok":blok_id
		};
		loadXHR(url+"general_ledger_c.php",obj,previewShow); 			

		function previewShow(paket){
			if (paket.err===0){
				var sum_start=0;
				var sum_debit=0,sum_credit=0;
				var sum_end=0;
				var company_name=company_data.company_name;
				html='<p>Total: '+paket.count+' rows</p>'
					+'<p>File name: <a href="" id="downloadLink" onclick="exportF(this,\'general_ledger_type_c\')">general_ledger_type_c.xls</a></p>'
					+'<table border=1 id="exportTable">'
					+'<caption>'
					+'<h1>'+company_name.toUpperCase()+'</h1>'
					+'<h2>GENERAL LEDGER</h2>'
					+'<h3>'+ account_data.account_class+'/'+account_data.account_id+ '/'+ account_data.account_name +'</h3>'
					+tglIna3(sdate.value)+' to ' +tglIna3(edate.value)
					+'</caption>'
					+'<th>Date</th>'
					+'<th>Notes</th>'
					+'<th>Ref.</th>'
					+'<th>Begin<br>('+tglIna(sdate.value)+')</th>'
					+'<th>Debit</th>'
					+'<th>Credit</th>'
					+'<th>End<br>('+tglIna(edate.value)+')</th>';

				// sort
				//paket.data.sort(function(a, b){return a.account_date - b.account_date});
				var abc=paket.data;
				//abc.sort(function(a, b){return a.account_date - b.account_date});
				abc.sort(function(a, b){
					var x = a.account_date.toLowerCase();
					var y = b.account_date.toLowerCase();
					if (x < y) {return -1;}
					if (x > y) {return 1;}
					return 0;
				});
				
				var saldo=0;
				for (var x in abc) {
					saldo+=parseFloat(paket.data[x].account_end);
					html+='<tr>'
						+'<td>'+tglIna2(paket.data[x].account_date)+'</td>'
						+'<td>'+paket.data[x].account_notes+'</td>'
						+'<td>'+paket.data[x].account_ref+'</td>'
						+'<td style="text-align:right">'+formatSerebuan(paket.data[x].account_start)+'</td>'
						+'<td style="text-align:right">'+formatSerebuan(paket.data[x].account_debit)+'</td>'
						+'<td style="text-align:right">'+formatSerebuan(paket.data[x].account_credit)+'</td>'
						+'<td style="text-align:right">'+formatSerebuan(saldo)+'</td>'
						+'</tr>';
						
					sum_start+=parseFloat(paket.data[x].account_start);
					sum_debit+=parseFloat(paket.data[x].account_debit);
					sum_credit+=parseFloat(paket.data[x].account_credit);
					sum_end+=parseFloat(paket.data[x].account_end);
				}
				
				html+='<tr>'
					+'<td style="text-align:right;font-weight:bold;" colspan=7>'+formatSerebuan(saldo)+'</td>'
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
	
	/* --- --- */
	this.formInput=function(tipe,sd,ed){
		formInput(tipe,sd,ed);
	}
	
	this.previewData=function(){
		previewData();
	}
	
	this.previewDataByType=function(tipe){
		previewDataByType(tipe);
	}
	
	this.previewTipeB=function(kelas,sd,ed){
		previewTipeB(kelas,sd,ed);
	}
	

	/*this.previewDataB=function(kelas){
		previewDataB(kelas);
	}*/
	
	this.previewDataC=function(blok_id){
		previewDataC(blok_id);
	}
	
	this.viewType=function(tipe){
		viewType(tipe);
	}
	
	this.searchAccount=function(){
		searchAccount();
	}
	
	this.selectAccount=function(data){
		selectAccount(data);
	}
	
	init();
	
	
}
