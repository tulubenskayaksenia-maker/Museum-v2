#!/usr/bin/env python3
"""
Публикация сайта на GitHub Pages (ветка gh-pages) с версиями файлов.

Зачем: телефоны (особенно Safari) держат старые .js/.css в памяти,
и после обновления посетитель видит старую версию музея.
Скрипт берёт текущий коммит, добавляет ко всем импортам JS и к CSS
метку ?v=<коммит>, и публикует результат в gh-pages.
Исходники в main при этом не меняются.

Запуск из корня проекта:
    python3 tools/deploy.py
"""

import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def git(*args, env=None, capture=True, cwd=ROOT):
    result = subprocess.run(
        ["git", *args],
        cwd=cwd,
        env=env,
        check=True,
        text=True,
        stdout=subprocess.PIPE if capture else None,
    )
    return (result.stdout or "").strip()


IMPORT_RE = re.compile(
    r'''((?:from|import)\s*\(?\s*["'])(\.{1,2}/[^"'?]+\.js)(["'])'''
)


def stamp_js(text, version):
    return IMPORT_RE.sub(lambda m: f"{m.group(1)}{m.group(2)}?v={version}{m.group(3)}", text)


def stamp_html(text, version):
    text = text.replace("__BUILD__", version)
    text = re.sub(
        r'''(src=["']\./main\.js)(["'])''',
        lambda m: f"{m.group(1)}?v={version}{m.group(2)}",
        text,
    )
    text = re.sub(
        r'''(href=["']\./[^"'?]+\.css)(["'])''',
        lambda m: f"{m.group(1)}?v={version}{m.group(2)}",
        text,
    )
    return text


def main():
    if git("status", "--porcelain", "--untracked-files=no"):
        sys.exit("Есть незакоммиченные изменения. Сначала закоммить их.")

    version = git("rev-parse", "--short", "HEAD")
    build = tempfile.mkdtemp(prefix="museum-build-")

    try:
        # Только файлы из коммита (без локальных архивов и оригиналов)
        archive = subprocess.run(
            ["git", "archive", "HEAD"], cwd=ROOT, check=True, stdout=subprocess.PIPE
        ).stdout
        subprocess.run(["tar", "-x", "-C", build], input=archive, check=True)

        changed = 0

        for folder, _, files in os.walk(build):
            for name in files:
                path = os.path.join(folder, name)

                if name.endswith(".js"):
                    with open(path, encoding="utf-8") as f:
                        text = f.read()
                    new = stamp_js(text, version)
                elif name == "index.html":
                    with open(path, encoding="utf-8") as f:
                        text = f.read()
                    new = stamp_html(text, version)
                else:
                    continue

                if new != text:
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(new)
                    changed += 1

        # Файл с номером версии: страница сверяется с ним при открытии
        with open(os.path.join(build, "version.json"), "w", encoding="utf-8") as f:
            f.write('{"build": "%s"}\n' % version)

        # Коммит в gh-pages через отдельный индекс, рабочая папка не трогается
        git("fetch", "-q", "origin", "gh-pages")
        parent = git("rev-parse", "origin/gh-pages")

        index_dir = tempfile.mkdtemp(prefix="museum-index-")

        env = dict(os.environ)
        env["GIT_DIR"] = os.path.join(ROOT, ".git")
        env["GIT_INDEX_FILE"] = os.path.join(index_dir, "index")
        env["GIT_WORK_TREE"] = build

        git("add", "-A", "--force", ".", env=env, cwd=build)
        tree = git("write-tree", env=env, cwd=build)
        shutil.rmtree(index_dir, ignore_errors=True)

        message = f"Deploy {version} with versioned assets"
        commit = git("commit-tree", tree, "-p", parent, "-m", message, env=env)

        env_push = dict(os.environ)
        env_push["GIT_TERMINAL_PROMPT"] = "0"
        git("push", "-q", "origin", f"{commit}:refs/heads/gh-pages", env=env_push)

        print(f"Опубликовано: версия {version}, файлов с метками: {changed}")
    finally:
        shutil.rmtree(build, ignore_errors=True)


if __name__ == "__main__":
    main()
