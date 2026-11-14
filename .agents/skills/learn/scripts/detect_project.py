#!/usr/bin/env python3
"""
Universal Project Detection Script for Antigravity /learn Workflow.
Inspects any repository across languages, frameworks, architectures,
test frameworks, databases, and Graphify status without external dependencies.
"""
import os
import sys
import json
import subprocess
from pathlib import Path

def run_cmd(cmd, cwd=None):
    try:
        res = subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True, text=True, timeout=10)
        return res.stdout.strip(), res.returncode
    except Exception as e:
        return str(e), -1

def detect_project(root_dir="."):
    root = Path(root_dir).resolve()
    result = {
        "root": str(root),
        "name": root.name,
        "is_git": (root / ".git").is_dir(),
        "git_status": None,
        "languages": [],
        "frameworks": [],
        "project_types": [],
        "entry_points": [],
        "manifests": [],
        "databases": [],
        "test_commands": [],
        "build_commands": [],
        "graphify": {
            "installed": False,
            "has_graph": False,
            "nodes": 0,
            "edges": 0,
            "is_stale": False,
            "version": None
        }
    }

    # 1. Git Status
    if result["is_git"]:
        out, code = run_cmd("git status --short", cwd=root)
        if code == 0:
            lines = [l for l in out.splitlines() if l.strip()]
            result["git_status"] = {
                "clean": len(lines) == 0,
                "modified_files_count": len(lines),
                "samples": lines[:5]
            }

    # 2. Manifests & Dependencies Mapping
    manifest_patterns = [
        ("package.json", "Node/JS/TS"),
        ("tsconfig.json", "TypeScript"),
        ("pyproject.toml", "Python"),
        ("requirements.txt", "Python"),
        ("setup.py", "Python"),
        ("Pipfile", "Python"),
        ("Cargo.toml", "Rust"),
        ("go.mod", "Go"),
        ("pom.xml", "Java/Maven"),
        ("build.gradle", "Java/Kotlin/Gradle"),
        ("build.gradle.kts", "Kotlin/Gradle"),
        ("Gemfile", "Ruby"),
        ("composer.json", "PHP"),
        ("CMakeLists.txt", "C/C++"),
        ("Makefile", "C/Make"),
        ("Package.swift", "Swift"),
        ("pubspec.yaml", "Flutter/Dart"),
        ("docker-compose.yml", "Docker"),
        ("Dockerfile", "Docker")
    ]

    for p, lang in manifest_patterns:
        matches = list(root.glob(p)) + list(root.glob(f"*/{p}"))
        if matches:
            if lang not in result["languages"]:
                result["languages"].append(lang)
            for m in matches:
                rel = str(m.relative_to(root))
                if rel not in result["manifests"]:
                    result["manifests"].append(rel)

    # 3. Inspect package.json(s)
    pkg_files = list(root.glob("package.json")) + list(root.glob("*/package.json"))
    for pkg_path in pkg_files:
        try:
            with open(pkg_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                scripts = data.get("scripts", {})

                # Check UI & Web frameworks
                if "react" in deps: result["frameworks"].append("React")
                if "next" in deps: result["frameworks"].append("Next.js")
                if "vue" in deps: result["frameworks"].append("Vue")
                if "svelte" in deps: result["frameworks"].append("Svelte")
                if "angular" in deps or "@angular/core" in deps: result["frameworks"].append("Angular")
                if "express" in deps: result["frameworks"].append("Express")
                if "nestjs" in deps or "@nestjs/core" in deps: result["frameworks"].append("NestJS")
                if "fastify" in deps: result["frameworks"].append("Fastify")
                if "tailwindcss" in deps: result["frameworks"].append("TailwindCSS")
                if "three" in deps: result["frameworks"].append("Three.js")
                if "socket.io" in deps or "socket.io-client" in deps: result["frameworks"].append("Socket.IO")

                # Databases & ORMs
                if "mysql2" in deps or "mysql" in deps: result["databases"].append("MySQL")
                if "pg" in deps or "postgres" in deps: result["databases"].append("PostgreSQL")
                if "sqlite3" in deps or "better-sqlite3" in deps: result["databases"].append("SQLite")
                if "mongoose" in deps or "mongodb" in deps: result["databases"].append("MongoDB")
                if "prisma" in deps or "@prisma/client" in deps: result["databases"].append("Prisma")
                if "typeorm" in deps: result["databases"].append("TypeORM")
                if "drizzle-orm" in deps: result["databases"].append("Drizzle")

                # Commands
                rel_dir = str(pkg_path.parent.relative_to(root))
                prefix = f"cd {rel_dir}; " if rel_dir != "." else ""
                if "test" in scripts: result["test_commands"].append(f"{prefix}npm test")
                if "build" in scripts: result["build_commands"].append(f"{prefix}npm run build")
        except Exception:
            pass

    # 4. Inspect Python environments
    py_files = list(root.glob("pyproject.toml")) + list(root.glob("requirements.txt"))
    for py_p in py_files:
        try:
            content = py_p.read_text(encoding="utf-8").lower()
            if "fastapi" in content: result["frameworks"].append("FastAPI")
            if "flask" in content: result["frameworks"].append("Flask")
            if "django" in content: result["frameworks"].append("Django")
            if "torch" in content or "pytorch" in content: result["frameworks"].append("PyTorch")
            if "tensorflow" in content or "keras" in content: result["frameworks"].append("TensorFlow")
            if "pandas" in content: result["frameworks"].append("Pandas")
            if "sqlalchemy" in content: result["databases"].append("SQLAlchemy")
            if "psycopg2" in content or "asyncpg" in content: result["databases"].append("PostgreSQL")
            if "pytest" in content: result["test_commands"].append("pytest")
        except Exception:
            pass

    # 5. Rust Cargo detection
    cargo_files = list(root.glob("Cargo.toml")) + list(root.glob("*/Cargo.toml"))
    if cargo_files:
        result["test_commands"].append("cargo test")
        result["build_commands"].append("cargo build")

    # 6. Go detection
    go_files = list(root.glob("go.mod")) + list(root.glob("*/go.mod"))
    if go_files:
        result["test_commands"].append("go test ./...")
        result["build_commands"].append("go build ./...")

    # 7. SQL schemas
    sql_files = list(root.glob("**/*.sql"))
    if sql_files and not any("SQL" in d for d in result["databases"]):
        result["databases"].append(f"SQL Schema ({len(sql_files)} file(s))")

    # 8. Entry points scan
    entry_candidates = [
        "src/index.ts", "src/index.js", "src/main.ts", "src/main.tsx", "src/main.py", "src/app.ts", "src/app.py",
        "index.ts", "index.js", "main.py", "app.py", "server.js", "server.ts",
        "backend/src/index.ts", "backend/src/server.ts", "frontend/src/main.tsx", "frontend/src/index.tsx",
        "cmd/main.go", "main.go", "src/main.rs"
    ]
    for cand in entry_candidates:
        if (root / cand).is_file():
            result["entry_points"].append(cand)

    # Deduplicate
    result["frameworks"] = sorted(list(set(result["frameworks"])))
    result["databases"] = sorted(list(set(result["databases"])))
    result["languages"] = sorted(list(set(result["languages"])))
    result["test_commands"] = sorted(list(set(result["test_commands"])))
    result["build_commands"] = sorted(list(set(result["build_commands"])))

    # Classification
    has_frontend = any(f in result["frameworks"] for f in ["React", "Next.js", "Vue", "Svelte", "Angular"])
    has_backend = any(f in result["frameworks"] for f in ["Express", "NestJS", "Fastify", "Django", "FastAPI", "Flask"])
    has_ml = any(f in result["frameworks"] for f in ["PyTorch", "TensorFlow", "Pandas"])

    if has_frontend and has_backend:
        result["project_types"].append("Full-Stack Web Application")
    elif has_frontend:
        result["project_types"].append("Frontend Web Application")
    elif has_backend:
        result["project_types"].append("Backend API / Web Service")
    elif has_ml:
        result["project_types"].append("AI / Machine Learning / Data Project")
    elif "Rust" in result["languages"] or "Go" in result["languages"]:
        result["project_types"].append("Systems / Compiled Application")
    elif len(result["languages"]) == 0 and len(list(root.glob("*"))) == 0:
        result["project_types"].append("Empty Workspace")
    else:
        result["project_types"].append("Software Repository / Library")

    # 9. Graphify status
    out, code = run_cmd("python -m graphify --version")
    if code == 0:
        result["graphify"]["installed"] = True
        result["graphify"]["version"] = out

    graph_json = root / "graphify-out" / "graph.json"
    if graph_json.is_file():
        result["graphify"]["has_graph"] = True
        try:
            with open(graph_json, "r", encoding="utf-8") as f:
                gdata = json.load(f)
                result["graphify"]["nodes"] = len(gdata.get("nodes", []))
                edges = gdata.get("links", []) or gdata.get("edges", [])
                result["graphify"]["edges"] = len(edges)
        except Exception:
            pass

    return result

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    data = detect_project(target)
    print(json.dumps(data, indent=2))
