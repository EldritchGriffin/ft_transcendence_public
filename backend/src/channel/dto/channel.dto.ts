import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";

export class ChannelDto {
    title: string;
    description: string;
    access: number;
    password: string;
}



export class Channel {
  id: number;
  createdAt: Date;
  title: string;
  description: string | null;
  members: any[];
  admins: any[];
  access: string;
  type: string;
  ownerLogin: string;
  constructor(channel : Channel) {
    this.id = channel.id;
    this.createdAt = channel.createdAt;
    this.title = channel.title;
    this.description = channel.description;
    this.members = channel.members;
    this.admins = channel.admins;
    this.access = channel.access;
    this.type = channel.type;
    this.ownerLogin = channel.ownerLogin;
  }
}

