#version 300 es

/* Lecture 21: Gouraud and Phong Shaders
 * CSCI 4611, Spring 2024, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

precision mediump float;

const int MAX_LIGHTS = 8;

uniform mat4 modelMatrix;
uniform mat4 normalMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform vec3 eyePositionWorld;

#define POINT_LIGHT 0
#define DIRECTIONAL_LIGHT 1

// properties of the lights in the scene
uniform int numLights;
uniform int lightTypes[MAX_LIGHTS];
uniform vec3 lightPositionsWorld[MAX_LIGHTS];
uniform vec3 ambientIntensities[MAX_LIGHTS];
uniform vec3 diffuseIntensities[MAX_LIGHTS];
uniform vec3 specularIntensities[MAX_LIGHTS];

// material properties (coefficents of reflection)
uniform vec3 kAmbient;
uniform vec3 kDiffuse;
uniform vec3 kSpecular;
uniform float shininess;

// per-vertex data
in vec3 position;
in vec3 normal;
in vec4 color;
in vec2 texCoord;

// data we want to send to the rasterizer and eventually the fragment shader
out vec4 vertColor;
out vec2 uv;

void main() 
{
    // position in homogenous coords is x, y, z, 1
    vec3 worldPosition = (modelMatrix * vec4(position, 1)).xyz;

    // vector in homogenous coords is x, y, z, 0
    vec3 worldNormal = normalize((normalMatrix * vec4(normal, 0)).xyz);

    // light calculations
    vec3 illumination = vec3(0, 0, 0);
    for(int i=0; i < numLights; i++)
    {
        // Ambient component
        illumination += kAmbient * ambientIntensities[i];

        // Don't forget to normalize the vectors!
        vec3 l;
        if(lightTypes[i] == POINT_LIGHT)
            l = normalize(lightPositionsWorld[i] - worldPosition);
        else
            l = normalize(lightPositionsWorld[i]); 

        // Diffuse component
        float diffuseComponent = max(dot(worldNormal, l), 0.0);
        illumination += diffuseComponent * kDiffuse * diffuseIntensities[i];

        // Compute the vector from the vertex to the eye
        vec3 e = normalize(eyePositionWorld - worldPosition);

        // Compute the halfway vector for the Blinn-Phong reflection model
        vec3 h = normalize(l + e);

        // Specular component
        float specularComponent = pow(max(dot(h, worldNormal), 0.0), shininess);
        illumination += specularComponent * kSpecular * specularIntensities[i];
    }

    // output the vertex color to the fragment shader
    vertColor = color;
    vertColor.rgb *= illumination;

    // output the texture coordinate to the fragment shader
    uv = texCoord.xy; 

    // compute the 2D screen coordinate position
    gl_Position = projectionMatrix * viewMatrix * vec4(worldPosition, 1);
}
