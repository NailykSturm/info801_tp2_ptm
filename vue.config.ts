import * as path from 'path';
import * as dotenv from 'dotenv';
import * as webpack from 'webpack';
import { Config } from '@jest/types';

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`
});

const config: Config.InitialOptions = {
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(dotenv.parsed)
      })
    ]
  }
};

export default config;