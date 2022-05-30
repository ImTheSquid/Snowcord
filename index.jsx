import Snowflakes from 'magic-snowflakes';

module.exports = (Plugin, Library) => {
    'use strict';

    const {DiscordModules, WebpackModules, Patcher, PluginUtilities} = Library;
    const {React} = DiscordModules;

    const headerBar = WebpackModules.find(mod => mod.default?.displayName === "HeaderBarContainer");

    const defaultPrefs = {
        isSnowing: true
    }

    let prefs = null;

    let snowflakes = null;

    class SnowflakeButton extends React.Component {
        constructor(props) {
            super(props);

            this.onClick = this.onClick.bind(this);
            this.state = {
                isSnowing: prefs.isSnowing
            }
        }

        onClick(_) {
            prefs.isSnowing ? snowflakes.hide() : snowflakes.show();
            prefs.isSnowing = !prefs.isSnowing;
            PluginUtilities.saveSettings('Snowcord', prefs);
            this.setState({isSnowing: prefs.isSnowing});
        }

        render() {
            return <button className='scClickable' onClick={this.onClick}>
                <svg className={this.state.isSnowing ? 'scIconSnowy' : 'scIcon'} height="24" width="24" x='0' y='0' viewBox='0 0 24 24'><path fill='currentColor' d="M11 22V17.85L7.75 21.05L6.35 19.65L11 15V13H9L4.35 17.65L2.95 16.25L6.15 13H2V11H6.15L2.95 7.75L4.35 6.35L9 11H11V9L6.35 4.35L7.75 2.95L11 6.15V2H13V6.15L16.25 2.95L17.65 4.35L13 9V11H15L19.65 6.35L21.05 7.75L17.85 11H22V13H17.85L21.05 16.25L19.65 17.65L15 13H13V15L17.65 19.65L16.25 21.05L13 17.85V22Z"/></svg>
            </button>
        }
    }

    return class Snowcord extends Plugin {
        onStart() {
            prefs = PluginUtilities.loadSettings('Snowcord', defaultPrefs);

            BdApi.injectCSS('Snowcord', `
                .snowflake__inner:before {
                    background-color: white;
                    border-radius: 100%;
                }

                .scClickable {
                    cursor: pointer;
                    background: none;
                }

                .scIcon {
                    color: var(--interactive-normal);
                }

                .scClickable:hover .scIcon {
                    color: var(--interactive-hover);
                }

                .scIconSnowy {
                    color: #4d91ff;
                }

                .scClickable:hover .scIconSnowy {
                    color: #7dafff;
                }
            `);

            snowflakes = new Snowflakes({
                rotation: false,
                color: '#fff',
                minSize: 5,
                maxSize: 15,
                minOpacity: 0.4,
                maxOpacity: 0.9,
                count: 30
            });
            snowflakes.start();
            if (!prefs.isSnowing) {
                snowflakes.hide();
            }

            Patcher.after(headerBar, "default", (_, __, ret) => {
                ret.props.children.props.toolbar.push(React.createElement(DiscordModules.Tooltip, {text: "Toggle Snowcord", position: "left"}, [
                    <SnowflakeButton/>
                ]));
            });
        }

        onStop() {
            snowflakes?.stop();
            snowflakes?.destroy();
            BdApi.clearCSS('Snowcord');
        }
    }
}