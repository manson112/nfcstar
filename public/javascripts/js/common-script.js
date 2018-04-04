function getDateType(dateStr){
	var dateArray = dateStr.split("-");
	return new Date(dateArray[0], Number(dateArray[1])-1, dateArray[2]);
}

function getDateToStr(date){
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	
	if(month<10) month = "0"+month;
	if(day<10) day = "0"+day;
	
	return year+'-'+month+'-'+day;
}

function getDiffDate(dateStr1, dateStr2){
	var date1 = getDateType(dateStr1);
	var date2 = getDateType(dateStr2);
	var diffDay = (date2-date1)/(24*3600*1000);
	
	return diffDay;
}

function getMinDate(dateStr, minDay){
	var date = getDateType(dateStr);
	var nowDay = date.getDate();
	
	date.setDate(nowDay + minDay);
	
	return getDateToStr(date);
}

function getWeek(dateStr){
	var date = getDateType(dateStr);
	var week = new Array('일','월','화','수','목','금','토');
	
	return week[date.getDay()];
}

function getBetweenDate(startDateStr, endDateStr){
	var arrayDate = new Array();
	var diffDay = getDiffDate(startDateStr, endDateStr);
	for(var i=1;i<=diffDay;i++) arrayDate[i-1] = getMinDate(startDateStr, i);
	
	return arrayDate;
}

function getTimeStamp() {
	var sysdate = new Date();
	var dateStr =
		leadingZeros(sysdate.getFullYear(), 4) + '-' +
		leadingZeros(sysdate.getMonth() + 1, 2) + '-' +
		leadingZeros(sysdate.getDate(), 2) + ' ' +
		
		leadingZeros(sysdate.getHours(), 2) + ':' +
		leadingZeros(sysdate.getMinutes(), 2) + ':' +
		leadingZeros(sysdate.getSeconds(), 2);
	
	return dateStr;
}
function leadingZeros(n, digits) {
	var zero = '';
	n = n.toString();
	
	if (n.length < digits) {
	  for (var i = 0; i < digits - n.length; i++)
	    zero += '0';
	}
	return zero + n;
}

function numberOnly(e) {
    var keyValue = event.keyCode;

    if( ((keyValue >= 48) && (keyValue <= 57)) ) return true;
    else return false;
}

function lpad(str, num, char){
	if( !str||!char||str.length>=num ){
		return str;
	}
	var max = num-str.length;
	for( var i=0;i<max;i++ ){
		str = char+str;
	}
	return str;
}

function ifNull(str){
	if(str==undefined || str==null || str=="") return '';
	return str;
}

function ifNull(str, char){
	if(str==undefined || str==null || str=="") return char;
	return str;
}

function ifNullNumber(str){
	if(str==undefined || str==null || str=="" || str=="-") return 0;
	
	return uncomma(str)*1;
}

function comma(str) {
    str = String(str);
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}

function uncomma(str) {
    str = String(str);
    return str.replace(/[^-\d]+/g, '');
}

function getBrowserType(){
    
    var _ua = navigator.userAgent;
    var rv = -1;
     
    //IE 11,10,9,8
    var trident = _ua.match(/Trident\/(\d.\d)/i);
    if( trident != null )
    {
        if( trident[1] == "7.0" ) return rv = "IE" + 11;
        if( trident[1] == "6.0" ) return rv = "IE" + 10;
        if( trident[1] == "5.0" ) return rv = "IE" + 9;
        if( trident[1] == "4.0" ) return rv = "IE" + 8;
    }
     
    //IE 7...
    if( navigator.appName == 'Microsoft Internet Explorer' ) return rv = "IE" + 7;
     
    /*
    var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if(re.exec(_ua) != null) rv = parseFloat(RegExp.$1);
    if( rv == 7 ) return rv = "IE" + 7; 
    */
     
    //other
    var agt = _ua.toLowerCase();
    if (agt.indexOf("chrome") != -1) return 'Chrome';
    if (agt.indexOf("opera") != -1) return 'Opera'; 
    if (agt.indexOf("staroffice") != -1) return 'Star Office'; 
    if (agt.indexOf("webtv") != -1) return 'WebTV'; 
    if (agt.indexOf("beonex") != -1) return 'Beonex'; 
    if (agt.indexOf("chimera") != -1) return 'Chimera'; 
    if (agt.indexOf("netpositive") != -1) return 'NetPositive'; 
    if (agt.indexOf("phoenix") != -1) return 'Phoenix'; 
    if (agt.indexOf("firefox") != -1) return 'Firefox'; 
    if (agt.indexOf("safari") != -1) return 'Safari'; 
    if (agt.indexOf("skipstone") != -1) return 'SkipStone'; 
    if (agt.indexOf("netscape") != -1) return 'Netscape'; 
    if (agt.indexOf("mozilla/5.0") != -1) return 'Mozilla';
}

//<input type="text" onkeyup="inputNumberFormat(this)" />
function inputNumberFormat(obj) {
	var str = "" + obj.value.replace(/,/gi,''); // 콤마 제거  
	var regx = new RegExp(/(-?\d+)(\d{3})/);  
	var bExists = str.indexOf(".",0);  
	var strArr = str.split('.');  
	while(regx.test(strArr[0])){  
	strArr[0] = strArr[0].replace(regx,"$1,$2");  
	}  
	if (bExists > -1)  
	obj.value = strArr[0] + "." + strArr[1];  
	else  
	obj.value = strArr[0]; 
}

function englishToKorean(obj1,obj2) {
    
	// 입력한 영문 텍스트 추출
	var text = obj1.value;
	var eng_text = obj2.value;

	// 변수 초기화
	var initialCode = -1;
	var medialCode = -1;
	var finalCode = 0;
	var temp = ''
	obj1.value = "";

	// 입력한 문자열 길이 추출
	var textLength = eng_text.length;

	for (var idx = 0; idx < textLength; idx++) {
		initialCode = -1
		medialCode = -1
		finalCode = 0
		result = ''

		// 초성 코드 추출
		initialCode = getCode('initial', eng_text.substring(idx, idx + 1));
		if (initialCode < 0) {
			medialCode = getCode('medial', eng_text.substring(idx, idx + 1));
			if (medialCode < 0) { //초성, 중성 다 아니면
				result = eng_text.substring(idx, idx + 1)
				obj1.value += result
				continue
			}
		} else {
			if (getCode('initial', eng_text.substring(idx + 1, idx + 2)) >= 0) {
				if (getCode('final', eng_text.substring(idx, idx + 2)) > 0
						&& idx + 2 <= textLength) { //종성이면
					finalCode = getCode('final', eng_text.substring(idx,
							idx + 2))
					result = String.fromCharCode(12593 + finalCode
							- (finalCode < 7 ? 1 : 0))
					obj1.value += result
					idx++
				} else {
					initialCode = initialCode / 21 / 28
					result = String.fromCharCode(12593
							+ initialCode
							+ (initialCode < 2 ? 0 : initialCode < 3 ? 1
									: initialCode < 6 ? 3
											: initialCode < 9 ? 10 : 11))
					obj1.value += result
				}
				continue
			}
		}
		if (medialCode < 0) { //첫 문자가 중성이 아니면
			idx++; // 다음 문자로.
		}

		/**
		 * 현재 문자와 다음 문자를 합한 문자열의 중성 코드 추출
		 * ㅞ ( np ) 또는 ㄼ ( fq ) 같은 두개의 문자가 들어가는 것을 체크하기 위함
		 */
		if (idx + 2 <= textLength) {
			tempMedialCode = getCode('medial', eng_text.substring(idx,
					idx + 2));
		} else {
			tempMedialCode = -1
		}

		// 코드 값이 있을 경우
		if (tempMedialCode != -1) {
			// 코드 값을 저장하고 인덱스가 다다음 문자열을 가르키게 한다.
			medialCode = tempMedialCode;
			idx += 2;
		} else // 코드값이 없을 경우 하나의 문자에 대한 중성 코드 추출
		{
			medialCode = getCode('medial', eng_text.substring(idx, idx + 1));
			idx++;
		}

		// 현재 문자와 다음 문자를 합한 문자열의 종성 코드 추출
		if (idx + 2 <= textLength) {
			tempFinalCode = getCode('final', eng_text.substring(idx,
					idx + 2));
		} else {
			tempFinalCode = -1
		}

		// 코드 값이 있을 경우
		if (tempFinalCode != -1) {
			// 코드 값을 저장한다.
			finalCode = tempFinalCode;

			// 그 다음의 중성 문자에 대한 코드를 추출한다.
			tempMedialCode = getCode('medial', eng_text.substring(idx + 2,
					idx + 3));

			// 코드 값이 있을 경우
			if (tempMedialCode != -1) {
				// 종성 코드 값을 저장한다.
				finalCode = getCode('final', eng_text.substring(idx,
						idx + 1));
			} else {
				idx++;
			}
		} else // 코드 값이 없을 경우
		{
			// 그 다음의 중성 문자에 대한 코드 추출
			tempMedialCode = getCode('medial', eng_text.substring(idx + 1,
					idx + 2));

			// 그 다음에 중성 문자가 존재할 경우
			if (tempMedialCode != -1) {
				// 종성 문자는 없음.
				finalCode = 0;
				idx--;
			} else {
				// 종성 문자 추출
				finalCode = getCode('final', eng_text.substring(idx,
						idx + 1));

				if (finalCode < 0) { //종성이 아니고
					var tmep_initialCode = getCode('initial', eng_text
							.substring(idx, idx + 1));
					if (tmep_initialCode < 0) { //초성도 아니면
						temp = eng_text.substring(idx, idx + 1)
					} else {
						idx--
					}
					finalCode = 0
				}
			}
		}

		// 추출한 초성 문자 코드, 중성 문자 코드, 종성 문자 코드를 합한 후 변환하여 출력
		//alert(initialCode+'/'+medialCode+'/'+finalCode)
		if (initialCode < 0) {
			if (medialCode >= 0) {
				result = String.fromCharCode(12623 + medialCode / 28)
			}
		} else {
			if (medialCode < 0) {
				initialCode = initialCode / 21 / 28
				result = String.fromCharCode(12593
						+ initialCode
						+ (initialCode < 2 ? 0 : initialCode < 3 ? 1
								: initialCode < 6 ? 3
										: initialCode < 9 ? 10 : 11))
			} else {
				result = String.fromCharCode(44032 + initialCode
						+ medialCode + finalCode);
			}
		}

		obj1.value += (result + temp);
		temp = ''
	}
}

/**
 * 해당 문자에 따른 코드를 추출한다.
 * @param type 초성 : chosung, 중성 : jungsung, 종성 : jongsung 구분
 * @param char 해당 문자
 */
function getCode(type, char) {
	// 초성
	var initial = "rRseEfaqQtTdwWczxvg";
	// 중성
	var medial = new Array('k', 'o', 'i', 'O', 'j', 'p', 'u', 'P', 'h',
			'hk', 'ho', 'hl', 'y', 'n', 'nj', 'np', 'nl', 'b', 'm', 'ml',
			'l');
	// 종성
	var final = new Array('r', 'R', 'rt', 's', 'sw', 'sg', 'e', 'f', 'fr',
			'fa', 'fq', 'ft', 'fx', 'fv', 'fg', 'a', 'q', 'qt', 't', 'T',
			'd', 'w', 'c', 'z', 'x', 'v', 'g');
	var returnCode; // 리턴 코드 저장 변수
	var isFind = false; // 문자를 찾았는지 체크 변수
	if (type == 'initial') {
		returnCode = initial.indexOf(char) * 21 * 28;
		isFind = true;
	} else if (type == 'medial') {
		for (var i = 0; i < medial.length; i++) {
			if (medial[i] == char) {
				returnCode = i * 28;
				isFind = true;
				break;
			}
		}
	} else if (type == 'final') {
		for (var i = 0; i < final.length; i++) {
			if (final[i] == char) {
				returnCode = i + 1;
				isFind = true;
				break;
			}
		}
	} else {
		alert("잘못된 타입입니다.");
	}
	if (isFind == false)
		returnCode = -1; // 값을 찾지 못했을 경우 -1 리턴
	return returnCode;
}