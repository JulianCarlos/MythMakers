import { FormControl } from "@angular/forms"
import { CharacterDto } from "@api/models";

export class CharacterDetailFormType {
    nickName: FormControl<string> = null;
    description: FormControl<string> = null;
    role: FormControl<string> = null;
    race: FormControl<string> = null;
    alignment: FormControl<string> = null;
    height: FormControl<number> = null;
    weight: FormControl<number> = null;
    eyeShape: FormControl<string> = null;
    eyeColorLeft: FormControl<string> = null;
    eyeColorRight: FormControl<string> = null;
    hairType: FormControl<string> = null;
    topTraits: FormControl<string> = null;
    temperament: FormControl<string> = null;
    goals: FormControl<string> = null;
    fears: FormControl<string> = null;
    habits: FormControl<string> = null;
    homeRegion: FormControl<string> = null;
    occupation: FormControl<string> = null;
    education: FormControl<string> = null;
    languages: FormControl<string> = null;
    backstory: FormControl<string> = null;
    skills: FormControl<string> = null;
    specialities: FormControl<string> = null;
    powers: FormControl<string> = null;
    tools: FormControl<string> = null;
    weapons: FormControl<string> = null;
    weaknesses: FormControl<string> = null;
    friends: FormControl<CharacterDto[]> = null;
}