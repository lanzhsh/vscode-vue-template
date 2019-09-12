const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

function generatePageName(dirName) {
    if (!dirName) {
        throw new Error('dir name should not be null');
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const nameArr = dirName.split('_');
    let className = '';
    
    for (const name of nameArr) {
        className += capitalizeFirstLetter(name);
    }
    
    return className;
}

function generatePage(componentName, fullPath, pageType) {
    if (fs.existsSync(fullPath)) {
        console.log(`${componentName} already exists, please choose another name.`);
        return;
    }

    const className = generatePageName(componentName);
    console.log(`class name: ${className}`);

    // create folder
    // fs.mkdirSync(fullPath);

    const apiTemplate = path.resolve(__dirname, './file_template/api.txt');
    const pageTemplate = path.resolve(__dirname, './file_template/page.txt');
    // const sassTemplate = path.resolve(__dirname, './file_template/scss.scss');
    // const sassFile = path.resolve(`${fullPath}/index.scss`);
    // fs.writeFileSync(sassFile, fs.readFileSync(sassTemplate, { encoding: 'utf-8' }));

    let jsFile;
    let jsFileContent;

    if (pageType === 'api') {
        jsFileContent = fs.readFileSync(apiTemplate, { encoding: 'utf-8' });
        jsFile = path.resolve(`${fullPath}.js`);
    } else if (pageType === 'page') {
        jsFileContent = fs.readFileSync(pageTemplate, { encoding: 'utf-8' });
        jsFile = path.resolve(`${fullPath}.vue`);
    }

    fs.writeFileSync(jsFile, jsFileContent.replace(/ClassName/g, className));

    exec(`cd ${fullPath} && git add .`, (err) => {
        if (err) {
            console.log('command fail:', 'git add .');
        } else {
            console.log('command success:', 'git add .');
        }
    });

   vscode.window.showInformationMessage('page created successfully!');
}

function activate(context) {
    console.log('Your extension "react-template" is now active!');

    const fc = vscode.commands.registerCommand('extension.createPage', function (param) {
        // The code you place here will be executed every time your command is executed

        // vscode.window.showInformationMessage(param.fsPath); 

        const folderPath = param.fsPath;

        const options = {
            prompt: "Please input the page name: ",
            placeHolder: "Page Name"
        }
        
        vscode.window.showInputBox(options).then(value => {
            if (!value) return;

            const pageName = value;
            const fullPath = `${folderPath}/${pageName}`;

            generatePage(pageName, fullPath, 'page');
        });
    });

    const pc = vscode.commands.registerCommand('extension.createApiPage', function (param) {
        const folderPath = param.fsPath;
        const options = {
            prompt: "Please input the component name: ",
            placeHolder: "Component Name"
        }
        
        vscode.window.showInputBox(options).then(value => {
            if (!value) return;

            const componentName = value;
            const fullPath = `${folderPath}/${componentName}`;

            generatePage(componentName, fullPath, 'api');
        });
    });

    context.subscriptions.push(fc);
    context.subscriptions.push(pc);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;