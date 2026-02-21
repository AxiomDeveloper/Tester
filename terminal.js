import { fileSystem } from './data.js';

export class Terminal {
    constructor(printCallback) {
        this.pwd = "/";
        this.fs = fileSystem;
        this.print = printCallback;
    }

    execute(commandStr) {
        const args = commandStr.trim().split(' ').filter(Boolean);
        if (args.length === 0) return;
        
        const cmd = args[0].toLowerCase();
        this.print(`root@mi5:${this.pwd}$ ${commandStr}`, 'log-cmd');

        switch(cmd) {
            case 'ls': this.ls(); break;
            case 'cd': this.cd(args[1]); break;
            case 'cat': this.cat(args[1]); break;
            case 'mv': this.mv(args[1], args[2]); break;
            case 'clear': document.getElementById('output').innerHTML = ''; break;
            default: this.print(`Command not found: ${cmd}`, 'log-error');
        }
    }

    resolvePath(target) {
        if (!target) return this.pwd;
        if (target === '..') {
            if (this.pwd === '/') return '/';
            const parts = this.pwd.split('/').filter(Boolean);
            parts.pop();
            return parts.length === 0 ? '/' : '/' + parts.join('/');
        }
        if (target.startsWith('/')) return target;
        return this.pwd === '/' ? `/${target}` : `${this.pwd}/${target}`;
    }

    ls() {
        const node = this.fs[this.pwd];
        if (node && node.type === 'dir') {
            this.print(node.contents.join('  '), 'log-data');
        }
    }

    cd(target) {
        if (!target) return;
        const path = this.resolvePath(target);
        if (this.fs[path] && this.fs[path].type === 'dir') {
            this.pwd = path;
        } else {
            this.print(`cd: ${target}: No such directory`, 'log-error');
        }
    }

    cat(target) {
        if (!target) return this.print("Usage: cat [filename]", "log-error");
        const path = this.resolvePath(target);
        if (this.fs[path] && this.fs[path].type === 'file') {
            this.print(this.fs[path].content, 'log-data');
        } else {
            this.print(`cat: ${target}: No such file`, 'log-error');
        }
    }

    mv(source, dest) {
        if (!source || !dest) return this.print("Usage: mv [file] [destination_dir]", "log-error");
        const srcPath = this.resolvePath(source);
        const destPath = this.resolvePath(dest);

        if (!this.fs[srcPath]) return this.print(`mv: cannot stat '${source}': No such file`, 'log-error');
        if (!this.fs[destPath] || this.fs[destPath].type !== 'dir') return this.print(`mv: target '${dest}' is not a directory`, 'log-error');

        // Extract filename
        const filename = srcPath.split('/').pop();
        const newPath = destPath === '/' ? `/${filename}` : `${destPath}/${filename}`;

        // Move in FS tree
        this.fs[newPath] = this.fs[srcPath];
        delete this.fs[srcPath];

        // Update parent directories
        const oldParentPath = srcPath.substring(0, srcPath.lastIndexOf('/')) || '/';
        this.fs[oldParentPath].contents = this.fs[oldParentPath].contents.filter(f => f !== filename);
        this.fs[destPath].contents.push(filename);

        this.print(`Moved ${filename} to ${destPath}`, 'log-success');
        this.checkWin();
    }

    checkWin() {
        // Simple win condition check based on the initial data
        const fin = this.fs["/secure_nodes/financial_crimes"].contents;
        if (fin.includes("wire_transfer.dat") && this.fs["/intercepts"].contents.length === 0) {
             this.print("\n=== SYSTEM DECRYPTED ===", "log-success");
             this.print("All files securely categorized. Good work, Agent.", "log-success");
        }
    }
}
