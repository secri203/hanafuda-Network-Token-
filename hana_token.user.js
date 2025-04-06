// ==UserScript==
// @name         Hana Network Token 获取器
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  自动获取并显示 Hana Network 网站的 token
// @author       Your Name
// @match        https://hanafuda.hana.network/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 创建显示 token 的容器样式
    const style = document.createElement('style');
    style.textContent = `
        #token-container {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 9999;
            max-width: 400px;
            word-break: break-all;
        }
        #token-container h3 {
            margin: 0 0 10px 0;
            color: #333;
            position: relative;
            padding-right: 20px;
        }
        #close-button {
            position: absolute;
            right: -5px;
            top: 0;
            background: none;
            border: none;
            color: #999;
            cursor: pointer;
            font-size: 18px;
            padding: 0;
            line-height: 1;
        }
        #close-button:hover {
            color: #666;
        }
        .token-section {
            margin-bottom: 15px;
        }
        .token-section h4 {
            margin: 0 0 5px 0;
            color: #666;
        }
        .token-value {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 3px;
            font-family: monospace;
            margin-bottom: 5px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .copy-button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 3px;
            cursor: pointer;
            margin-right: 5px;
        }
        .copy-button:hover {
            background: #45a049;
        }
    `;
    document.head.appendChild(style);

    // 创建显示 token 的容器
    const container = document.createElement('div');
    container.id = 'token-container';
    container.innerHTML = `
        <h3>
            Token 信息
            <button id="close-button">×</button>
        </h3>
        <div class="token-section">
            <h4>Access Token</h4>
            <div id="access-token-value" class="token-value">等待获取 token...</div>
            <button class="copy-button" data-token="access">复制 Access Token</button>
        </div>
        <div class="token-section">
            <h4>Refresh Token</h4>
            <div id="refresh-token-value" class="token-value">等待获取 token...</div>
            <button class="copy-button" data-token="refresh">复制 Refresh Token</button>
        </div>
    `;
    document.body.appendChild(container);

    // 添加关闭功能
    document.getElementById('close-button').addEventListener('click', function() {
        document.getElementById('token-container').style.display = 'none';
    });

    // 定期检查 sessionStorage 中的 token
    function checkTokens() {
        try {
            const sessionStorage = window.sessionStorage;
            const firebaseKey = Object.keys(sessionStorage).find(key => key.includes('firebase'));
            
            if (firebaseKey) {
                const firebaseData = JSON.parse(sessionStorage.getItem(firebaseKey));
                if (firebaseData && firebaseData.stsTokenManager) {
                    const { accessToken, refreshToken } = firebaseData.stsTokenManager;
                    // 存储完整的 token 到 data 属性中
                    document.getElementById('access-token-value').setAttribute('data-full-token', accessToken);
                    document.getElementById('refresh-token-value').setAttribute('data-full-token', refreshToken);
                    // 显示缩短的 token
                    document.getElementById('access-token-value').textContent = shortenToken(accessToken);
                    document.getElementById('refresh-token-value').textContent = shortenToken(refreshToken);
                }
            }
        } catch (error) {
            console.error('获取 token 时出错:', error);
        }
    }

    // 缩短 token 显示的函数
    function shortenToken(token) {
        if (!token) return '';
        const length = token.length;
        if (length <= 20) return token;
        return token.substring(0, 10) + '...' + token.substring(length - 10);
    }

    // 添加复制功能
    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', function() {
            const tokenType = this.getAttribute('data-token');
            const tokenElement = document.getElementById(`${tokenType}-token-value`);
            const fullToken = tokenElement.getAttribute('data-full-token');
            if (fullToken && fullToken !== '等待获取 token...') {
                navigator.clipboard.writeText(fullToken).then(() => {
                    alert(`${tokenType === 'access' ? 'Access' : 'Refresh'} Token 已复制到剪贴板！`);
                });
            }
        });
    });

    // 每秒钟检查一次 token
    setInterval(checkTokens, 1000);
    // 立即执行一次检查
    checkTokens();
})(); 