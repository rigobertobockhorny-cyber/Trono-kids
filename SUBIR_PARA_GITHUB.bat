@echo off
chcp 65001 > nul
title Enviando Trono Kids para o GitHub...
color 0A
cd /d "C:\PROJETOS\5-FERRAMENTAS\DEPLOY_TRONO_KIDS"

echo =====================================================================
echo       VÓRTICE MÍDIA - DEPLOY TRONO DA PROMESSA KIDS NO GITHUB
echo =====================================================================
echo.
echo 1. Verificando repositório e arquivos...
git status
echo.
echo 2. Enviando para o GitHub (https://github.com/rigobertobockhorny-cyber/trono-kids.git)...
echo.
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo =====================================================================
    echo   [SUCESSO!] O aplicativo foi enviado com sucesso para o GitHub!
    echo   Agora você já pode conectar no Render e gerar o link público.
    echo =====================================================================
) else (
    echo.
    echo =====================================================================
    echo   [AVISO] Se deu erro de 'Repository not found', certifique-se
    echo   de ter criado o repositório 'trono-kids' no GitHub primeiro:
    echo   https://github.com/new
    echo =====================================================================
)
echo.
pause
