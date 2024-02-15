const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const ImageminWebpWebpackPlugin = require('imagemin-webp-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const mode = process.env.NODE_ENV || 'development';
const devMode = mode === 'development';
const target = devMode ? 'web' : 'browserslist';
const devtool = devMode ? 'source-map' : undefined;
const PAGES_DIR = path.join(__dirname, './src');
console.log(__dirname);
console.log(PAGES_DIR);

const PAGES = fs.readdirSync(PAGES_DIR).filter((fileName) => fileName.endsWith('.html'));

const HTML_FILES = glob.sync('./src/*.html');
const pages = HTML_FILES.map((page) => {
    return new HtmlWebpackPlugin({
        template: path.resolve(__dirname, page),
        filename: path.basename(page),
        chunks: [path.basename(page, '.html'), 'main']
    });
});

const INCLUDE_PATTERN = /<include\s+src=["'](\.\/)?([^"']+)["'](?:\s+data-text='([^']+)')?\s*><\/include>/g;

// Пример использования регулярного выражения

const { JSDOM } = require('jsdom');

function processNestedHtml(content, loaderContext, resourcePath = '') {
    let fileDir = resourcePath === '' ? path.dirname(loaderContext.resourcePath) : path.dirname(resourcePath);

    function replaceHtml(match, pathRule, src, dataText) {
        console.log('Match:', match);
        console.log('Path Rule:', pathRule);
        console.log('Source:', src);
        console.log('Data Text:', dataText);
        if (pathRule === './') {
            fileDir = loaderContext.context;
        }
        const filePath = path.resolve(fileDir, src);
        loaderContext.dependency(filePath);
        let html = fs.readFileSync(filePath, 'utf8');

        try {
            const data = JSON.parse(dataText);
            const dom = new JSDOM(html);
            const document = dom.window.document;

            Object.keys(data).forEach((selector) => {
                const elementData = data[selector];
                const elements = document.querySelectorAll(selector);

                if (elements.length > 0) {
                    elements.forEach((element) => {
                        if (elementData.text) {
                            element.textContent = elementData.text;
                        }
                        if (elementData.html) {
                            element.innerHTML = elementData.html;
                        }
                        if (elementData.class) {
                            element.classList.add(elementData.class);
                        }
                    });
                } else {
                    console.error(`Elements with selector "${selector}" not found in ${src}`);
                }
            });

            console.log('document.documentElement.innerHTML: ', document.body.innerHTML);
            html = document.body.innerHTML; // Получаем только содержимое <html>
        } catch (error) {
            console.error(`Error parsing data-text attribute: ${error.message}`);
        }

        return html; // Возвращаем только содержимое компоненты без оборачивания в теги <html>, <head> и <body>
    }

    if (!INCLUDE_PATTERN.test(content)) {
        return content;
    } else {
        console.log(content.replace(INCLUDE_PATTERN, replaceHtml));
        return content.replace(INCLUDE_PATTERN, replaceHtml);
    }
}

const entryPoints = HTML_FILES.reduce((entries, page) => {
    const entryName = path.basename(page, '.html');
    entries[entryName] = path.resolve(__dirname, page);
    return entries;
}, {});

function processHtmlLoader(content, loaderContext) {
    let newContent = processNestedHtml(content, loaderContext);
    newContent = newContent.replace(/(src|data-src)="(.*?)\.(jpg|png)"/gi, (match, p1, p2, p3) => {
        return `${p1}="${p2}.webp"`;
    });
    return newContent;
}

module.exports = {
    mode,
    target,
    devtool,
    devServer: {
        static: './dist',
        port: 3000,
        open: true,
        hot: true,
        watchFiles: ['./src/**/*.html']
    },

    entry: {
        index: path.resolve(__dirname, 'src/js', 'app.js'),
    },
    // entry: getEntries(),
    output: {
        //куда выводит билд
        path: path.resolve(__dirname, 'dist'),
        //очистка билда перед сборкой нового
        clean: true,
        //название js файла в билде
        // [name] - стандартный по вебпаку (main), [contenthash] - добавляептся хэш к названию
        filename: '[name][contenthash].js'
        // assetModuleFilename: "assets/images",
    },

    plugins: [
        new FaviconsWebpackPlugin('./src/assets/images/favicon.svg'),
        new CleanWebpackPlugin(),

        ...pages,
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash:8].css',
            chunkFilename: '[name].[contenthash:8].css'
        }),
        new ImageMinimizerPlugin({
            minimizer: {
                implementation: ImageMinimizerPlugin.imageminMinify, // Выбор реализации минимизации изображений
                options: {
                    plugins: [
                        'imagemin-gifsicle', // Плагин для оптимизации GIF изображений
                        'imagemin-mozjpeg', // Плагин для оптимизации JPEG изображений
                        'imagemin-pngquant', // Плагин для оптимизации PNG изображений
                        'imagemin-svgo' // Плагин для оптимизации SVG изображений
                    ]
                }
            }
        }),
        new ImageminWebpWebpackPlugin({
            config: [
                {
                    test: /\.(jpe?g|png)/,
                    options: {
                        quality: 90,
                        overrideExtension: true
                    }
                }
            ],
            detailedLogs: false,
            silent: false,
            strict: true
        }),
        new CopyPlugin({
          patterns: [
              {
                  from: path.resolve(__dirname, './', 'src/assets/', 'images'),
                  to: path.resolve(__dirname, './', 'dist/assets/', 'images')
              },
              {
                  from: path.resolve(__dirname, './', 'src/assets/', 'fonts'),
                  to: path.resolve(__dirname, './', 'dist/assets/', 'fonts')
              }
          ]
      })
    ],

    module: {
        rules: [
            {
                test: /\.html$/i,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            sources: false,
                            minimize: false,
                            esModule: false,
                            preprocessor: processHtmlLoader
                        }
                    }
                ]
            },
            // изображения
            {
                test: /\.(jpe?g|png|webp|gif|svg)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.(c|sa|sc)ss$/i,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            esModule: false,
                            modules: {
                                auto: true,
                                namedExport: true,
                                localIdentName: 'foo__[name]__[local]'
                            },
                            url: false
                        }
                    },
                    'sass-loader'
                ]
            },
            // шрифты
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/fonts/[name][ext]'
                }
            },
            //js
            {
                test: /\.(?:js|mjs|cjs)$/i,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [['@babel/preset-env', { targets: 'defaults' }]]
                    }
                }
            },
        ]
    }
};
