class AssetManager {
    // Base paths for assets
    private basePath: string;
    private modelsPath: string;
    private materialPath: string;
    private texturesPath: string;
    private soundsPath: string;

    constructor() {
        this.basePath = "/static/resources/assets";
        this.modelsPath = this.basePath + "/models";
        this.materialPath = this.basePath + "/materials";
        this.texturesPath = this.basePath + "/textures";
        this.soundsPath = this.basePath + "/sounds";
    }

    /**
     * Get the full path of a 3D model.
     * @param modelName - Name of the model file (e.g., "myModel.obj").
     * @returns The full path to the model.
     */
    public getModel(modelName: string): string {
        return this.modelsPath + "/" + modelName;
    }

    /**
     * Get the full path of a material file (.mtl).
     * @param materialName - Name of the mtl file (e.g., "myModel.mtl").
     * @returns The full path to the material file.
     */
    public getMaterial(materialName: string): string {
        return this.materialPath + "/" + materialName;
    }

    /**
     * Get the full path of a texture.
     * @param textureName - Name of the texture file (e.g., "myTexture.png").
     * @returns The full path to the texture.
     */
    public getTexture(textureName: string): string {
        return this.texturesPath + "/" + textureName;
    }

    /**
     * Get the full path of a sound file.
     * @param soundName - Name of the sound file (e.g., "mySound.mp3").
     * @returns The full path to the sound.
     */
    public getSound(soundName: string): string {
        return this.soundsPath + "/" + soundName;
    }

    /**
     * Get the full path of an asset based on its type.
     * @param type - The type of asset ("model", "texture", or "sound").
     * @param assetName - The name of the asset file.
     * @returns The full path to the asset.
     * @throws Error if the asset type is unknown.
     */
    public getAsset(type: "model" | "texture" | "sound", assetName: string): string {
        switch (type) {
            case "model":
                return this.getModel(assetName);
            case "texture":
                return this.getTexture(assetName);
            case "sound":
                return this.getSound(assetName);
            default:
                throw new Error(`Unknown asset type: ${type}`);
        }
    }
}

export default new AssetManager();
