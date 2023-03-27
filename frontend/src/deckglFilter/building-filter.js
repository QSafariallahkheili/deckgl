import { LayerExtension } from "@deck.gl/core/typed";

//Layer expander, used to rewrite and expand Shader
export class BuildingFilter extends LayerExtension {
    
    getShaders() {
        return {
        inject: {
            //Inject vertex shader declaration
            "vs:#decl": `
                        varying vec2 vPosition;
                        attribute float elevatt;
                        varying float vElevatt;
                    `,
            //Inject vertex shader, assign value to varying variable
            "vs:#main-end": `
                        vPosition = vertexPositions;
                        vElevatt = elevatt;

                    `,
            //Inject the fragment shader declaration
            "fs:#decl": `
                        varying vec2 vPosition;
                        varying float vElevatt;
                    `,
            //Override the color drawing function
            "fs:DECKGL_FILTER_COLOR": `
                    
                        if (vPosition.y < 1.0){
                            color = vec4(color.xyz, color.w * pow(vPosition.y,2.0));
                           
                        }
                        else {
                            if (vElevatt <= 10.){
                                color = vec4(0., 1.0, 0., 0.8);
                            }
                            else if (vElevatt > 10. && vElevatt < 20.){
                               
                                color = vec4(1., 1., 0., 1.);
                            }
                            else if (vElevatt > 20. && vElevatt < 30.){
                                vec3 mixcolor = vec3(0.0);
                                
                                mixcolor = mix(vec3(1.0,0.0,0.0), vec3(0.0,0.0,1.0), 0.5);
                                color = vec4(1., .65, 0., 1.);
                            }
                            else {
                                color = vec4(1., 0., 0. , 1.);
                            }
                        }
                            
                    `,
        },
        };
        
    }

    initializeState(params) {
        super.initializeState(params);
        this.getAttributeManager()?.add({
            elevatt: {
              size: 1,
              accessor: 'getElevation'
            },

        })
    }
    
    
    updateState(params) {
        const { heightvalue = 3. } = params.props;
        for (const model of this.getModels()) {
            model.setUniforms({ heightvalue });
        }
    }
}
