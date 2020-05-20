// ==UserScript==
// @name         KLAS Helper Develop
// @namespace    https://github.com/nbsp1221
// @description  광운대학교 KLAS 사이트에 편리한 기능을 추가할 수 있는 유저 스크립트 (개발 버전)
// @match        https://klas.kw.ac.kr/*
// @run-at       document-start
// @homepageURL  https://github.com/nbsp1221/klas-helper
// @supportURL   https://github.com/nbsp1221/klas-helper/issues
// @author       nbsp1221
// @copyright    2020, nbsp1221 (https://openuserjs.org/users/nbsp1221)
// @license      MIT
// @grant        GM.xmlHttpRequest
// ==/UserScript==

// JavaScript 파일 캐시 문제 해결
function jsCache(filePath) {
	const nowDate = new Date();
	const cacheValue = nowDate.getYear() + nowDate.getMonth() + nowDate.getDay() + nowDate.getHours() + nowDate.getMinutes();
	return filePath + '?v=' + cacheValue;
}

(function () {
	'use strict';

	// 메인 파일 삽입
	// 업데이트 시 즉각적으로 업데이트를 반영하기 위해 이러한 방식을 사용함
	const scriptElement = document.createElement('script');
	scriptElement.src = jsCache('https://nbsp1221.github.io/klas-helper/scripts/main.js');
	document.head.appendChild(scriptElement);

	// window.onload 설정
	window.addEventListener('load', () => {
		// internalPathFunctions 함수 실행
		for (const path in internalPathFunctions) {
			if (path === location.pathname) {
				internalPathFunctions[path]();
			}
		}
	});
})();

// 태그에 삽입되지 않는 함수 목록
// GM 기능을 사용하기 위해 유저 스크립트 내부의 함수가 필요
const internalPathFunctions = {
	// 온라인 강의 화면
	'/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do': () => {
		// 온라인 강의 동영상 다운로드
		const downloadVideo = (videoCode) => {
			GM.xmlHttpRequest({
				method: 'GET',
				url: 'https://kwcommons.kw.ac.kr/viewer/ssplayer/uniplayer_support/content.php?content_id=' + videoCode,
				onload: function (response) {
					const documentXML = response.responseXML;
					const videoURLs = [];

					// 분할된 동영상 등 다양한 상황 처리
					if (documentXML.getElementsByTagName('desktop').length > 0) {
						videoURLs.push(documentXML.getElementsByTagName('media_uri')[0].innerHTML)
					}
					else {
						const mediaURI = documentXML.getElementsByTagName('media_uri')[0].innerHTML;

						for (const videoName of documentXML.getElementsByTagName('main_media')) {
							videoURLs.push(mediaURI.replace('[MEDIA_FILE]', videoName.innerHTML));
						}
					}

					// 다운로드 버튼 렌더링
					for (let i = 0; i < videoURLs.length; i++) {
						const labelElement = document.createElement('label');
						labelElement.innerHTML = `<a href="${videoURLs[i]}" target="_blank" style="background-color: brown; color: white; font-weight: bold; padding: 10px; text-decoration: none">동영상 받기 #${i + 1}</a>`;
						document.querySelector('.mvtopba > label:last-of-type').after(labelElement);
					}
				}
			});
		};

		// 고유 번호를 받을 때까지 대기
		const waitTimer = setInterval(() => {
			const videoCode = document.body.getAttribute('data-video-code');

			if (videoCode) {
				clearInterval(waitTimer);
				downloadVideo(videoCode);
			}
		}, 100);

		// 일정 시간이 지날 경우 타이머 해제
		setTimeout(() => {
			clearInterval(waitTimer);
		}, 10000);
	}
};