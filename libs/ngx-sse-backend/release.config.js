const projectName = 'ngx-sse-backend';
const packageRoot = 'libs/ngx-sse-backend';

module.exports = {
  extends: 'semantic-release-npm-github-publish',
  pkgRoot: `dist/${packageRoot}`,
  tagFormat: projectName + '-v${version}',
  commitPaths: [`${packageRoot}/*`],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changeLogFile: `${packageRoot}/CHANGELOG.md`,
      },
    ],
    '@semantic-release/npm',
    [
      '@semantic-release/git',
      {
        assets: [`${packageRoot}/package.json`, `${packageRoot}/CHANGELOG.md`],
        message:
          `release(version): Release ${projectName} ` +
          '${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};